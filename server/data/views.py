from django.http import HttpResponse
import numpy as np
import csv
import json
from pathlib import Path
import pickle
from scipy import sparse
import scanpy as sc
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.colors import LinearSegmentedColormap, to_hex, rgb2hex
import matplotlib
import qnorm
from scipy.sparse import csr_matrix
from collections import defaultdict
import pandas as pd
import gzip
from scipy.sparse.csgraph import connected_components

####################### Set the name of the sample you want to visualize #####################################
current_directory = './data/files/' #./data/3D_files/
data_name = 'PDAC_64630' #animal_id1

def get_num_edge(request):
    df = pd.read_csv(current_directory+'NEST_combined_rank_product_output_'+data_name+'_top20percent.csv', sep=",")
    return HttpResponse(len(df.index))

def get_vertex_types(request):
    pathologist_label_file=current_directory+'IX_annotation_artifacts.csv' 
    pathologist_label=[]
    with open(pathologist_label_file) as file:
        csv_file = csv.reader(file, delimiter=",")
        for line in csv_file:
            pathologist_label.append(line)
    
    annotation_dict = dict()
    for i in range (1, len(pathologist_label)):
        if pathologist_label[i][1] not in annotation_dict:
            annotation_dict[pathologist_label[i][1]] = len(annotation_dict)
    return HttpResponse(json.dumps(annotation_dict), content_type='application/json')

def load_json(request, edge):
    top_edge_count = edge
    
    ######################## read data in csv format ########################################
    cell_barcode = pd.read_csv(current_directory+'cell_barcode_'+data_name+'.csv', header=None)
    cell_barcode = list(cell_barcode[0]) # first column is: cell barcode. Convert it to list format for conveniance
    
    temp = pd.read_csv(current_directory+'coordinates_'+data_name+'.csv', header=None)
    coordinates = np.zeros((len(cell_barcode), 3)) # num_cells x coordinate
    for i in range (0, len(temp)):
        coordinates[i,0] = temp[0][i] # x
        coordinates[i,1] = temp[1][i] # y
        coordinates[i,2] = temp[2][i] # z
    
    self_loop_found = []
    self_loop_path = Path(current_directory+'self_loop_record_'+data_name+'.gz')
    if self_loop_path.is_file():
        with gzip.open(current_directory+'self_loop_record_'+data_name+'.gz', 'rb') as fp:
            self_loop_found = pickle.load(fp)
    ##################### make cell metadata: barcode_info ###################################
    i=0
    barcode_serial = dict()
    for cell_code in cell_barcode:
        barcode_serial[cell_code]=i
        i=i+1
        
    i=0
    barcode_info=[]
    for cell_code in cell_barcode:
        barcode_info.append([cell_code, coordinates[i,0],coordinates[i,1], coordinates[i,2], 0]) # last entry will hold the component number later
        i=i+1
    
    ####### load annotations ##############################################
    pathologist_label_file=current_directory+'IX_annotation_artifacts.csv' 
    pathologist_label=[]
    with open(pathologist_label_file) as file:
        csv_file = csv.reader(file, delimiter=",")
        for line in csv_file:
            pathologist_label.append(line)
        
    barcode_type=dict() # record the type (annotation) of each spot (barcode)
    for i in range (1, len(pathologist_label)):
        barcode_type[pathologist_label[i][0]] = pathologist_label[i][1]
        
    ######################### read the NEST output in csv format ####################################################
    
    filename_str = 'NEST_combined_rank_product_output_'+data_name+'_top20percent.csv'
    inFile = current_directory +filename_str 
    df = pd.read_csv(inFile, sep=",")
    
    #print('All reading done. Now start processing.')
    
    ######################## sort the edges in ascending order of rank and take top_edge_count edges to plot ##########
    
    csv_record = df.values.tolist()
    
    ## sort the edges based on their rank (column 4) column, low to high, low rank being higher attention score
    csv_record = sorted(csv_record, key = lambda x: x[4])
    
    ## add the column names and take first top_edge_count edges
    # columns are: from_cell, to_cell, ligand_gene, receptor_gene, attention_score, component, from_id, to_id
    df_column_names = list(df.columns)
    csv_record_final = [df_column_names] + csv_record[0:top_edge_count]
    
    ## add a dummy row at the end for the convenience of histogram preparation (to keep the color same as altair plot)
    i=0
    j=0
    csv_record_final.append([barcode_info[i][0], barcode_info[j][0], 'no-ligand', 'no-receptor', 0, 0, i, j]) # dummy for histogram
    
    ######################## connected component finding #################################
    
    connecting_edges = np.zeros((len(barcode_info),len(barcode_info)))  
    for k in range (1, len(csv_record_final)-1): # last record is a dummy for histogram preparation
        i = csv_record_final[k][6]
        j = csv_record_final[k][7]
        connecting_edges[i][j]=1
    graph = csr_matrix(connecting_edges)
    n_components, labels = connected_components(csgraph=graph,directed=True, connection = 'weak',  return_labels=True) # It assigns each SPOT to a component based on what pair it belongs to
    #print('number of connected components %d'%n_components)
    
    count_points_component = np.zeros((n_components))
    for i in range (0, len(labels)):
         count_points_component[labels[i]] = count_points_component[labels[i]] + 1
    #print(count_points_component)
    
    id_label = 2 # initially all are zero. = 1 those who have self edge. >= 2 who belong to some component
    index_dict = dict()
    for i in range (0, count_points_component.shape[0]):
        if count_points_component[i]>1:
            index_dict[i] = id_label
            id_label = id_label+1
    
    for i in range (0, len(barcode_info)):
        if count_points_component[labels[i]] > 1:
            barcode_info[i][4] = index_dict[labels[i]] #2
        elif connecting_edges[i][i] == 1 and (i in self_loop_found and i in self_loop_found[i]): # that is: self_loop_found[i][i] do exist 
            barcode_info[i][4] = 1
        else: 
            barcode_info[i][4] = 0
    
    # update the label based on found component numbers
    #max opacity
    for record in range (1, len(csv_record_final)-1):
        i = csv_record_final[record][6]
        label = barcode_info[i][4]
        csv_record_final[record][5] = label
    
    component_list = dict()
    for record_idx in range (1, len(csv_record_final)-1): #last entry is a dummy for histograms, so ignore it.
        record = csv_record_final[record_idx]
        i = record[6]
        j = record[7]
        component_label = record[5]
        barcode_info[i][4] = component_label 
        barcode_info[j][4] = component_label
        component_list[component_label] = ''
    
    component_list[0] = ''
    unique_component_count = len(component_list.keys())
    
    ############################  Network Plot ######################
    from data.altairThemes import get_colour_scheme  # assuming you have altairThemes.py at your current directoy or your system knows the path of this altairThemes.py.
    set1 = get_colour_scheme("Set1", unique_component_count+1)
    colors = set1
    colors[0] = '#dddddd'
    ids = []
    x_index=[]
    x_min = 2**32-1
    y_index=[]
    y_min = 2**32-1
    z_index=[]
    z_min = 2**32-1
    colors_point = []
    for i in range (0, len(barcode_info)):    
        ids.append(i)
        x_index.append(barcode_info[i][1])
        y_index.append(barcode_info[i][2])
        z_index.append(barcode_info[i][3])
        x_min = min(x_index[i], x_min)
        y_min = min(y_index[i], y_min)
        z_min = min(z_index[i], z_min)
        colors_point.append(colors[barcode_info[i][4]])
    
    annotation_dict = dict()
    for i in range (1, len(pathologist_label)):
        if pathologist_label[i][1] in annotation_dict:
            barcode_type[pathologist_label[i][0]] = annotation_dict[pathologist_label[i][1]]
        else:
            annotation_dict[pathologist_label[i][1]] = len(annotation_dict)
            barcode_type[pathologist_label[i][0]] = annotation_dict[pathologist_label[i][1]]
    print(annotation_dict)
    
    nodes = []
    for i in range(0, len(barcode_info)):
        label_str = barcode_info[i][0]+', C:'+str(barcode_info[i][4]) # label of the node or spot is consists of: spot id, component number, type of the spot 
        t = {
            "id": ids[i],
            # change these values to center visualization
            "fx": (x_index[i] - x_min) / 5 - 1000,
            "fy": (y_index[i] - y_min) / 5 - 800,
            "fz": (z_index[i] - z_min) / 5,
            "color": matplotlib.colors.rgb2hex(colors_point[i]),
            "shape": barcode_type[barcode_info[i][0]],
            "component":barcode_info[i][4],
            "label": label_str
        }
        nodes.append(t)

    links = []
    for k in range(1, len(csv_record_final)-1):
        i = csv_record_final[k][6]
        j = csv_record_final[k][7]
        ligand = csv_record_final[k][2]
        receptor = csv_record_final[k][3]
        edge_rank = csv_record_final[k][4] 
        title_str =  "L:" + ligand + ", R:" + receptor+ ", "+ str(edge_rank)
        t = {
            "source": i,
            "target": j,
            "ligand": ligand,
            "receptor": receptor,
            "label": title_str,
            "value": np.float64(edge_rank),
            "ligand-receptor": ligand+"-"+receptor,
            "component": barcode_info[i][4]
        }
        links.append(t)
    
    jsonfile = json.dumps({"nodes": nodes, "links": links})
    response = HttpResponse(jsonfile, content_type='application/json')
    return response