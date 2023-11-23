from django.shortcuts import render
from django.http import HttpResponse

import numpy as np
import json
import csv
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
import argparse
from scipy.sparse.csgraph import connected_components
import scipy.stats

def load_json(request, edge):
    top_edge_count = edge
    ####################### Set the name of the sample you want to visualize #####################################
    current_directory = './data/files/'
    data_name = 'PDAC_64630'
    
    ######################## read data in csv format ########################################
    gene_ids = pd.read_csv(current_directory+'gene_ids_'+data_name+'.csv', header=None)
    gene_ids = list(gene_ids[0]) # first column is the gene ids. Convert it to list format for conveniance
    
    cell_barcode = pd.read_csv(current_directory+'cell_barcode_'+data_name+'.csv', header=None)
    cell_barcode = list(cell_barcode[0]) # first column is: cell barcode. Convert it to list format for conveniance
    
    temp = pd.read_csv(current_directory+'coordinates_'+data_name+'.csv', header=None)
    coordinates = np.zeros((len(cell_barcode), 2)) # num_cells x coordinate
    for i in range (0, len(temp)):
        coordinates[i,0] = temp[0][i] # x
        coordinates[i,1] = temp[1][i] # y
    
    with gzip.open(current_directory+'self_loop_record_'+data_name+'.gz', 'rb') as fp:  #b, a:[0:5]   _filtered
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
        barcode_info.append([cell_code, coordinates[i,0],coordinates[i,1], 0]) # last entry will hold the component number later
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
            barcode_info[i][3] = index_dict[labels[i]] #2
        elif connecting_edges[i][i] == 1 and (i in self_loop_found and i in self_loop_found[i]): # that is: self_loop_found[i][i] do exist 
            barcode_info[i][3] = 1
        else: 
            barcode_info[i][3] = 0
    
    # update the label based on found component numbers
    #max opacity
    for record in range (1, len(csv_record_final)-1):
        i = csv_record_final[record][6]
        label = barcode_info[i][3]
        csv_record_final[record][5] = label
    
    
    component_list = dict()
    for record_idx in range (1, len(csv_record_final)-1): #last entry is a dummy for histograms, so ignore it.
        record = csv_record_final[record_idx]
        i = record[6]
        j = record[7]
        component_label = record[5]
        barcode_info[i][3] = component_label 
        barcode_info[j][3] = component_label
        component_list[component_label] = ''
    
    component_list[0] = ''
    unique_component_count = len(component_list.keys())
    
    ############################  Network Plot ######################
    from data.altairThemes import get_colour_scheme  # assuming you have altairThemes.py at your current directoy or your system knows the path of this altairThemes.py.
    set1 = get_colour_scheme("Set1", unique_component_count)
    colors = set1
    colors[0] = '#000000'
    ids = []
    x_index=[]
    x_min = 2**32-1
    y_index=[]
    y_min = 2**32-1
    colors_point = []
    for i in range (0, len(barcode_info)):    
        ids.append(i)
        x_index.append(barcode_info[i][1])
        y_index.append(barcode_info[i][2])
        x_min = min(x_index[i], x_min)
        y_min = min(y_index[i], y_min)
        colors_point.append(colors[barcode_info[i][3]]) 
    max_x = np.max(x_index)
    max_y = np.max(y_index)
    
    
    barcode_type=dict()
    for i in range (1, len(pathologist_label)):
        if 'tumor'in pathologist_label[i][1]: #'Tumour':
            barcode_type[pathologist_label[i][0]] = 1
        else:
            barcode_type[pathologist_label[i][0]] = 0
    
    import json
    nodes = []
    for i in range(0, len(barcode_info)):
        label_str =  str(i)+'_c:'+str(barcode_info[i][3])+'_' # label of the node or spot is consists of: spot id, component number, type of the spot 
        if barcode_type[barcode_info[i][0]] == 0: #stroma
            marker_size = 'circle'
            label_str = label_str + 'stroma'
        elif barcode_type[barcode_info[i][0]] == 1: #tumor
            marker_size = 'box'
            label_str = label_str + 'tumor'
        else:
            marker_size = 'ellipse'
            label_str = label_str + 'acinar_reactive'
        t = {
            "id": ids[i],
            "fx": (x_index[i] - x_min + 100) / 12,
            "fy": (y_index[i] - y_min + 100) / 12,
            "fz": 0,
            "color": matplotlib.colors.rgb2hex(colors_point[i]),
            "shape": marker_size,
            "label": label_str
        }
        nodes.append(t)

    links = []
    for k in range(1, len(csv_record_final)-1):
        i = csv_record_final[k][6]
        j = csv_record_final[k][7]
        ligand = csv_record_final[k][2]
        receptor = csv_record_final[k][3]
        edge_score = csv_record_final[k][8] 
        title_str =  "L:" + ligand + ", R:" + receptor+ ", "+ str(edge_score)
        t = {
            "source": i,
            "target": j,
            "ligand": ligand,
            "receptor": receptor,
            "label": title_str,
            "value": np.float64(edge_score),
            "ligand-receptor": ligand+"-"+receptor,
            "component": barcode_info[i][3]
        }
        links.append(t)
    
    jsonfile = json.dumps({"nodes": nodes, "links": links})
    response = HttpResponse(jsonfile, content_type='application/json')
    return response