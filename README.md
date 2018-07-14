# Technologies
  - [Socket.io] for websocket server and client
  - [Mocha] for backend unit testing
  - [React] to create dashboard
  - [Repatch] as state management for React

# Completeness
  - Backend unit testing
  - Frontend unit testing for functions
  - Dashboard
  - Drone simulator (`resin-ws-drone/executables/drone-simulator.js`)

# Cellular Connections are Expensive
  - The drone is only asked to send token only once during the handshake.
  - Lat and long are sent just in numbers.

# Assumptions
  - Drones start flying from 0 coordinate.

# Room for Improvement
## Technical
  - In `ws.js`, the event names are messy. It should be in this rule: `from-to-event`, so it's going to be easy to distinguish.
  - The WS server only uses 1 replica. Since this is a websocket, so I'm not sure whether the handshake will be managed automatically properly if there are more than 1 replica. Stress test is needed to make sure about this.
## Product
  - Dashboard should use Google Maps
  - Dashboard can zoom in and zoom out automatically, based on drone positions
  - Color of drones in dashboard should vary
  - If users and credentiols are added to the dashboard, this system can become SaaS

   [socket.io]: <https://socket.io/>
   [mocha]: <https://mochajs.org/>
   [react]: <https://reactjs.org/>
   [repatch]: <https://github.com/jaystack/repatch>