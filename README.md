
## Features

- backend API to create blogs.
- each blog is associated with a user and each user may or may not have associated blogs.
- when a user creates a blog, a .docx file will be created with the users id in the "blogs" directory.
- the file will be created, update and deleted in accordance to the API requests received. 



## Run Locally

Clone the project

```bash
  git clone https://github.com/AdishtJaglan/blog-application-backend.git
```

Go to the project directory

```bash
  cd blog-application-backend
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  nodemon index.js
```


## Setup

to properly run the backend, you must create a "blogs" directory or else errors will be thrown. 

```bash
  cd blog-application-backend
```

then paste this command

```bash
  mkdir blogs
```