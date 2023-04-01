module.exports = {
  apps: [
    {
      name: "anti-human-ai",
      script: "npm",
      automation: false,
      args: "start",
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }
  ]
}
