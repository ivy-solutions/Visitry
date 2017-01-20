module.exports = {
  servers: {
    one: {
      host: 'production.visitry.org',
      username: 'ubuntu',
      // for CircleCi:
      pem: '/home/ubuntu/.ssh/id_staging-server',
      //for Sarah;s machine
      //pem: '/Users/sarahcoletti/VISITRY.pem',
      // password:
      // or leave blank for authenticate from ssh-agent
      opts: {
        port: 22,
      },
    }
  },

  meteor: {
    name: 'Visitry',
    // For CircleCI
    path: '/home/ubuntu/Visitry',
    //for Sarah's machine
    //path: '/Users/sarahcoletti/WebstormProjects/Visitry',
    docker: {
      image: 'abernix/meteord:base', // use this image if using Meteor 1.4+
    },
    servers: {
      one: {}
    },
    buildOptions: {
      serverOnly: true,
      debug: false,
      cleanAfterBuild: true, // default
      buildLocation: '/home/ubuntu/build/Visitry', // defaults to /tmp/<uuid>
      //buildLocation: '/Users/sarahcoletti/build/Visitry', // defaults to /tmp/<uuid>
    },
    env: {
      PORT: 3000,
      ROOT_URL: 'https://production.visitry.org',
      MONGO_URL: 'mongodb://localhost/meteor'
    },
    ssl: {
      port: 443,
      crt: 'bundle.crt',
      key: 'private.key',
    },

    deployCheckWaitTime: 120
  },

  mongo: {
    oplog: true,
    port: 27017,
    servers: {
      one: {},
    },
  },
};