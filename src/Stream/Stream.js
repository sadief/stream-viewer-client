/* global gapi */
import React, { Component } from 'react';
import axios from 'axios';

const byPropKey = (propertyName, value) => () => ({
    [propertyName]: value
});

class Stream extends Component {

    constructor(props) {
        super(props);
        this.state = {
            id: props.location.state.key,
            name: props.location.state.name,
            chatId: null,
            messages: null,
            newMessage: ""
        };
    }

    storeMessage = () => {
        console.log(this.state.messages.length)
        var msgs = {}
        var msg = {}
        for (var i = 0; i < this.state.messages.length; i++) {
            msg["displayName"] = this.state.messages[i].authorDetails.displayName + "";
            msg["displayMessage"] = this.state.messages[i].snippet.displayMessage + "";
            msg["published"] = this.state.messages[i].snippet.publishedAt + "";
            msg["chatID"] = this.state.chatId
            msgs[this.state.messages[i].id] = msg
            msg = {}
        }

        axios.post('http://localhost:3030/messages', {
            messages: msgs,
        })
            .then(function (response) {
            })
            .catch(function (error) {
                console.log(error);
            });
    };

    sendMessage = (event) => {
        event.preventDefault();

        return gapi.client.youtube.liveChatMessages.insert({
            "part": "snippet",
            "resource": {
                "snippet": {
                    "liveChatId": "Cg0KC2hIVzFvWTI2a3hR",
                    "type": "textMessageEvent",
                    "textMessageDetails": {
                        "messageText": this.state.newMessage
                    }
                }
            }
        })
            .then(function (response) {
            },
                function (err) { console.error("Execute error", err); });
    }

    async componentDidMount() {

        function loadClient() {
            return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
                .then(function () {
                    gapi.load('client', execute);
                    console.log("GAPI client loaded for API");
                },
                    function (err) { console.error("Error loading GAPI client for API", err); });
        }

        var execute = () => {
            return gapi.client.youtube.videos.list({
                "part": "snippet, liveStreamingDetails",
                "id": this.state.id
            })
                .then((response) => {
                    this.setState({ chatId: response.result.items[0].liveStreamingDetails.activeLiveChatId })
                    gapi.load('client', getChat)
                },
                    function (err) { console.error("Execute error", err); });
        }
        var getChat = () => {
            return gapi.client.youtube.liveChatMessages.list({
                "liveChatId": this.state.chatId,
                "part": "snippet,authorDetails",
            })
                .then((response) => {
                    this.setState({ messages: response.result.items })
                    gapi.load('client', getChat)
                    this.storeMessage()
                },
                    function (err) {
                        console.error("Execute error", err);
                        gapi.load('client', getChat)
                    });
        }
        gapi.load("client:auth2", function () {
            gapi.auth2.init({ client_id: process.env.REACT_APP_YOUTUBE_CLIENT_ID });
        });
        gapi.load('client', loadClient)
    }

    render() {
        // console.log("Current State: ", this.state)
        const { id, name, messages } = this.state;
        const live = "https://www.youtube.com/embed/" + id


        if (id === null) return <p>Loading ...</p>;
        return (
            <div className="container">
                <div className="row">
                    <div className="jumbotron col-6">
                        <h1 className="display-3">{name}</h1>
                        <hr className="my-4" />
                        <iframe title={name} width="560" height="315" src={live} frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                    </div>
                    <div className="jumbotron col-6">
                        <h1 className="display-3">Chat</h1>
                        <hr className="my-4" />

                        {messages === null && <p>Loading messages...</p>}

                        {
                            messages && messages.slice(Math.max(messages.length - 5, 1)).map(message => (
                                <div key={message.id} >
                                    <div className="card text-white bg-success mb-3">

                                        <div className="card-header d-flex justify-content-between py-0 px-2">
                                            {message.authorDetails.displayName}
                                            <p>{message.snippet.publishedAt}</p>
                                        </div>
                                        <div className="card-body py-0 px-2">
                                            <p className="card-text py-0 px-2">{message.snippet.displayMessage}</p>
                                        </div>
                                    </div>

                                </div>
                            ))
                        }
                        <hr className="my-4" />
                        <div className="d-flex">
                            <input onChange={event =>
                                this.setState(byPropKey("newMessage", event.target.value))
                            } className="form-control" type="text" placeholder="Chat Away!"></input>
                            <button className="btn btn-secondary" type="submit" onClick={event => this.sendMessage(event)}>Send</button>
                        </div>
                    </div>
                </div>

            </div >
        )
    }
}

export default Stream;