# Technologies
- Socket.io for websocket server and client
- [Mocha] for backend unit testing
- [React] to create dashboard

# Completeness
- Backend unit testing
- Dashboard

# Cellular connections are expensive
  - The drone is only asked to send token only once during the handshake.
  - Lat and long are sent just in numbers.

# Room for Improvement
  - Dashboard should use Google Maps
  - Dashboard can zoom in and zoom out automatically, based on drone positions
  - Color of drones in dashboard should vary
  - If users and credentiols are added to the dashboard, this application can become SaaS

   [mocha]: <https://mochajs.org/>
   [react]: <https://reactjs.org/>