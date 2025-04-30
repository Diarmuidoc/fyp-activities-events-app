# FYP Diarmuid O Connor  Activity and Event Web app
This project was created as my final year computing project.

## Project Outline
This project is an Angular Web app, developed in WebStorm.
The app uses the Google Maps API, Google Place API and Ticketmaster API to display activities and event in the area near the user.
The app user Firebase authentication for user to sign up and log in.
The app uses Firestore for storing a list of saved activities by the user.

The site is broken up into  many pages:
- Home page, or landing page
- Activity page, displays activities near the user, uses the Places API
- Event page, displays events near the user, uses the Ticketmaster API
- User Profile page, displays the list of saved activities
- Sign up / Log in, allows users to sign up or log in

The app was developed using WebStorm, to run the app, the WebStorm app button will automatically start the server, however to have the activities page run correctly, the backend-proxy must be started "using node server.js". This server runs on localhost:3000 and must run simultaniously to the app.

To run the application, a Google Developer API key, Ticketmaster API key, and Firebase API key are all required to go in an enviroment.ts file.




This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.1.5.

## Development server

To start a local development server, run:

```bash
ng serve
```


