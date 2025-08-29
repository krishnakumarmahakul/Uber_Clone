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

## Captain Overview

A **Captain** represents a driver in the Uber Clone platform.  
Captains manage ride requests, have personal profiles and vehicle details.  
They must register and authenticate to access protected captain routes.

## Endpoint: `/captain/register`

### Method
`POST`

### Request Body
- `fullname.firstname` (string, required): First name, min 3 characters.  
- `fullname.lastname` (string, optional): Last name, min 3 characters.  
- `email` (string, required): Valid email format.  
- `password` (string, required): Min 6 characters.  
- `vehicle.color` (string, required): Min 3 characters.  
- `vehicle.plate` (string, required): Min 3 characters.  
- `vehicle.capacity` (number, required): Min 1.  
- `vehicle.vehicleType` (string, required): One of `car`, `motorcycle`, `auto`.  

#### Success (201)
```json
{
  "success": true,
  "message": "Captain registered successfully",
  "captain": {
    "id": "captain_id",
    "fullname": {
      "firstname": "Jane",
      "lastname": "Doe"
    },
    "email": "jane.doe@example.com",
    "vehicle": {
      "color": "Blue",
      "plate": "ABC123",
      "capacity": 4,
      "vehicleType": "car"
    }
  },
  "token": "jwt_token"
}
```

#### Validation Error (400)
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

## Endpoint: `/captain/login`

### Method
`POST`

### Request Body
- `email` (string, required): Valid email format.  
- `password` (string, required): Min 6 characters.  

#### Success (200)
```json
{
  "success": true,
  "message": "Captain logged in successfully",
  "captain": {
    "id": "captain_id",
    "fullname": {
      "firstname": "Jane",
      "lastname": "Doe"
    },
    "email": "jane.doe@example.com",
    "vehicle": {
      "color": "Blue",
      "plate": "ABC123",
      "capacity": 4,
      "vehicleType": "car"
    }
  },
  "token": "jwt_token"
}
```

#### Authentication Error (401)
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```
