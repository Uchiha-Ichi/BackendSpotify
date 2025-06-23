# BackendSpotify

BackendSpotify is a backend system for a music streaming application inspired by Spotify. It provides RESTful APIs for user authentication, music management, playlist/album handling, and leverages Google Drive for scalable song storage.

## Features

- **User Authentication & Authorization**
  - Secure registration and login with JWT token-based authentication.
  - Supports user profile management and password updates.

- **Role-based Access Control**
  - Two main roles: `Admin` and `User`.
  - Admins have full access to manage all users, songs, albums, and playlists.
  - Users can manage their own account, playlists, and favorite songs. Permissions are enforced via middleware.

- **Music Management**
  - Singers/Artists can add new songs, delete their own songs, and create albums to organize their music.
  - Song files are stored securely and scalably on Google Drive cloud storage.

- **Playlist & Album**
  - Users can create, update, and delete their own playlists and albums.
  - Organize music and share themed collections.

- **Search & Playback**
  - Search for songs, artists, albums, and playlists.
  - Stream songs directly from cloud storage.

## Technology Stack

- Node.js, Express.js
- MongoDB
- JWT for authentication
- Google Drive API for song storage

## Roles & Permissions

- **Admin**
  - Full system access, including managing all resources.
- **User**
  - Access limited to personal data and actions.
- All permissions are enforced via secure JWT authentication and middleware.

## Storage

- Song and image files are stored and managed on Google Drive, ensuring scalability and reliable access.

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in a `.env` file:
   ```
   JWT_ACCESS_KEY=your_access_secret
   JWT_REFRESH_KEY=your_refresh_secret
   MONGODB_URI=your_mongodb_uri
   CLIENT_ID=your_google_client_id
   CLIENT_SECRET=your_google_client_secret
   REDIRECT_URI=your_google_redirect_uri
   REFRESH_TOKEN=your_google_refresh_token
   FOLDER_SONG=your_google_drive_song_folder_id
   FOLDER_IMG=your_google_drive_image_folder_id
   ```
4. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

- Authentication: `/api/auth/`
- Songs: `/api/song/`
- Albums: `/api/album/`
- Playlists: `/api/playlist/`

## License

This project is licensed under the MIT License.
