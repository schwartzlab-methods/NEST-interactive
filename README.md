# NEST-Interactive

## Instructions:

### Frontend:

1. If VSCode is installed, adding the "Live Server" extension from Ritwick Dey makes spinning up a server easy. Access the server hosted at http://127.0.0.1:5500/HTML%20file/NEST-vis.html
2. Otherwise
   - run `python -m http.server 80` from the root directory
   - open http://localhost and navigate to "HTML file" then "NEST-vis.html"
   - Server should be hosted at http://localhost/HTML%20file/NEST-vis.html

### Backend:

- Navigate into the "server" directory (`cd server`)
- Install pipenv
- Run `pipenv shell` then `pipenv install`

  - The required packages are

    ![image](https://github.com/schwartzlab-methods/nest-interactive/assets/43073270/f0d8a619-6470-4662-8819-7be1becfdb04)

- Set environment variables (Examples use Windows Powershell):
  1. The directory relative to root in which your input files are saved, e.g. `$env:DIRECTORY="./data/files/"`
  2. The common name that identifies input files, e.g. `$env:FILENAME="PDAC_64630"`
- Run `python .\manage.py runserver`
