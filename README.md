# NEST-Interactive

## Instructions:

### Frontend:

1. If VSCode is installed, adding the "Live Server" extension from Ritwick Dey makes spinning up a server easy. Access the server hosted at http://127.0.0.1:5500/HTML%20file/NEST-vis.html
2. Otherwise
   - Run `python -m http.server 80` from the root directory
   - Open http://localhost and navigate to "HTML file" then "NEST-vis.html"
   - Server should be hosted at http://localhost/HTML%20file/NEST-vis.html

### Backend:

- Navigate into the server directory (`cd server`)
- Install pipenv
- Run `pipenv shell` then `pipenv install`

  - The required packages are

    ![image](https://github.com/schwartzlab-methods/nest-interactive/assets/43073270/f0d8a619-6470-4662-8819-7be1becfdb04)

- OPTIONAL: To use your own input files, upload them in a directory under server/data. Note that the name of this directory is referred to as *DIRECTORY_NAME* and the common identifier across file names is referred to as *FILE_IDENTIFIER* (e.g. cell_barcode_**PDAC_64630**). For custom data, run `python .\manage.py setdata DIRECTORY_NAME FILE_IDENTIFIER`. To return to default, run `python .\manage.py setdata ./data/files/ PDAC_64630`
- Run `python .\manage.py runserver`
