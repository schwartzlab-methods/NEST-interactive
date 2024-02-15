# Schwartz-Lab-Vis

## Instructions:
### Frontend:
1. If VSCode is installed, adding the "Live Server" extension from Ritwick Dey makes spinning up a server easy. Access the server hosted at http://127.0.0.1:5500/HTML%20file/NEST-vis.html
2. Otherwise
   - run `python -m http.server` from the root directory
   - open http://localhost:8000 and navigate to "HTML file" then "NEST-vis.html"
   - Server should be served at http://localhost:8000/HTML%20file/NEST-vis.html

### Backend: 
- Navigate into the "server" directory
- Install pipenv
- Run `pipenv shell` then `pipenv install`
  - The required packages are

    ![image](https://github.com/schwartzlab-methods/nest-interactive/assets/43073270/65e3d49c-042d-41bb-8418-a7f57edf9fa6)
- Run `python .\manage.py runserver`

run with `$pipenv shell` then `$python manage.py runserver`
