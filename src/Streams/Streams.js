/* global gapi */

import React, { Component } from 'react';
import auth0Client from '../Auth.js'


class Streams extends Component {
    constructor(props) {
        super(props);

        this.state = {
            streams: null,
        };
    }

    viewStream = (id, name, event) => {
        event.preventDefault();
        const { history } = this.props;
        history.push({ pathname: `/video/${id}`, state: { key: id, name: name } });
    };

    authenticate = () => {
        return gapi.auth2.getAuthInstance()
            .signIn({ scope: "https://www.googleapis.com/auth/youtube.readonly" })
            .then(() => {
                gapi.load('client', this.loadClient);
                console.log("Sign-in successful");
            },
                function (err) { console.error("Error signing in", err); });
    }

    loadClient = () => {
        return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
            .then(() => {
                gapi.load('client', this.execute);
                console.log("GAPI client loaded for API");
            },
                function (err) { console.error("Error loading GAPI client for API", err); });
    }

    execute = () => {
        return gapi.client.youtube.search.list({
            "part": "snippet,id",
            "eventType": "live",
            "maxResults": 12,
            "type": "video"
        })
            .then((response) => {
                // Handle the results here (response.result has the parsed body).
                this.setState({ streams: response.result.items })
                console.log("Response", response);
            },
                function (err) { console.error("Execute error", err); });
    }
    async componentDidMount() {
        gapi.load("client:auth2", function () {
            gapi.auth2.init({ client_id: process.env.REACT_APP_YOUTUBE_CLIENT_ID });
        });
    }

    render() {
        return (
            <div className="container">
                {auth0Client.isAuthenticated() ? (
                    <div>
                        <h2>Current top Youtube Live Streams</h2>
                        {!this.state.streams ? (<button className="btn btn-primary m-2" onClick={event => this.authenticate()} type="submit">Click here to Authenticate with Youtube and view the LiveStreams</button>) : null}
                        <div className="row">
                            {
                                this.state.streams && this.state.streams.map(stream => (
                                    <div key={stream.id.videoId} className="col-sm-12 col-md-4 col-lg-3">
                                        {/* <Link to={`/stream/${stream.id}`}> */}
                                        <div className="card text-white bg-success mb-3">
                                            <div className="card-header"> <h5 className="card-title">{stream.snippet.channelTitle}</h5></div>
                                            <div className="card-body d-flex flex-column">
                                                <img alt="video thumbnail url" src={stream.snippet.thumbnails.default.url} />
                                                <button className="btn btn-primary m-2" onClick={event => this.viewStream(stream.id.videoId, stream.snippet.channelTitle, event)}
                                                    type="submit">Watch</button>
                                                <p className="card-text"></p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                ) : (
                        <div>
                            <h2>Please sign in to access Youtube Live Streaming Videos</h2>

                        </div>
                    )
                }
            </div>
        )
    }
}

export default Streams;