const config = {
    monday_app: {
        client_id: process.env.REACT_APP_CLIENT_ID,
        auth_url: 'https://auth.monday.com/oauth2/authorize/',
        signing_secret: process.env.REACT_APP_SIGNING_SECRET,
        redirect_uri: 'https://tb.carbonweb.co/auth'
    },
    api: {
        base_url: 'https://tb.carbonweb.co',
    }
}

module.exports = config;