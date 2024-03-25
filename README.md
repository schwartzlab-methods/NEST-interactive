# ![alt text](https://github.com/schwartzlab-methods/nest-interactive/blob/main/nest_logo.svg) NEST-Interactive

## Instructions:
Navigate into the pulled nest_interactive directory. Please run the following command with three arguments:
1. Desired port to run the frontend, e.g., 8080
2. Path to the directory having NEST output and required metadata files, e.g., barcode, coordinates, etc.
3. Name of the data that you want to visualize on the interactive nest, e.g., PDAC_64630 or V1_Human_Lymph_Node_spatial (the --data_name argument that is used during running the NEST model).

````
bash nest_interactive 8080 server/data/files/ PDAC_64630
````

### Frontend:

1. If VSCode is installed, adding the "Live Server" extension from Ritwick Dey makes spinning up a server easy. Access the server hosted at http://127.0.0.1:5500/HTML%20file/NEST-vis.html
2. Otherwise
   - Run `python -m http.server 8080` from the root directory
   - Open http://localhost and navigate to "HTML file" then "NEST-vis.html"
   - Server should be hosted at http://localhost/HTML%20file/NEST-vis.html

### Backend:

- Navigate into the server directory (`cd server`)
- Install pipenv
- Run `pipenv shell` then `pipenv install`

  - The required packages are:
  ```
  django
  numpy
  scipy
  matplotlib
  pandas
  altair
  django-cors-headers
  ```

- OPTIONAL: To use your own input files, upload them in a directory under server/data. Note that the name of this directory is referred to as *DIRECTORY_NAME* and the common identifier across file names is referred to as *FILE_IDENTIFIER* (e.g. cell_barcode_**PDAC_64630**). For custom data, run `python ./manage.py setdata DIRECTORY_NAME FILE_IDENTIFIER`. To return to default, run `python ./manage.py setdata ./data/files/ PDAC_64630`
- Run `python ./manage.py runserver`
