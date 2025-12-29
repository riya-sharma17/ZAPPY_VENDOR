import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:3007",
});

export default API;
