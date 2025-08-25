#  Backend API Documentation

## Endpoint: `/user/register`

### Description
This endpoint is used to register a new user in the system.

### Method
`POST`

### Request Body
The following fields are required in the request body:
- `fullname.firstname` (string, required): The first name of the user. Must be at least 3 characters long.
- `fullname.lastname` (string, optional): The last name of the user.
- `email` (string, required): The email address of the user. Must be a valid email format.
- `password` (string, required): The password for the user. Must be at least 6 characters long.

Example JSON:
```json
{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com",
  "password": "securepassword"
}
```

### Response

#### Success (201)
- **Description**: User registered successfully.
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "user": {
      "id": "user_id",
      "fullname": {
        "firstname": "John",
        "lastname": "Doe"
      },
      "email": "john.doe@example.com"
    },
    "token": "jwt_token"
  }
  ```

#### Validation Error (400)
- **Description**: Validation failed for the input data.
- **Response Body**:
  ```json
  {
    "errors": [
      {
        "msg": "Invalid Email",
        "param": "email",
        "location": "body"
      }
    ]
  }
  ```

### Notes
- Ensure that the `email` field is unique.
- Passwords are hashed before being stored in the database.
- A JWT token is returned upon successful registration.

## Endpoint: `/user/login`

### Description
This endpoint is used to authenticate a user and provide a JWT token for subsequent requests.

### Method
`POST`

### Request Body
The following fields are required in the request body:
- `email` (string, required): The email address of the user. Must be a valid email format.
- `password` (string, required): The password for the user.

Example JSON:
```json
{
  "email": "john.doe@example.com",
  "password": "securepassword"
}
```

### Response

#### Success (200)
- **Description**: User authenticated successfully.
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "user": {
      "id": "user_id",
      "fullname": {
        "firstname": "John",
        "lastname": "Doe"
      },
      "email": "john.doe@example.com"
    },
    "token": "jwt_token"
  }
  ```

#### Authentication Error (401)
- **Description**: Invalid email or password.
- **Response Body**:
  ```json
  {
    "success": false,
    "message": "Invalid email or password"
  }
  ```

### Notes
- Ensure that the `email` exists in the database.
- Passwords are verified against the hashed version stored in the database.
- A JWT token is returned upon successful authentication.
