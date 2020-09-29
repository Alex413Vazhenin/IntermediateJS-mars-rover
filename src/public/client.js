const { Map, List } = require("immutable");

const store = Map({
    roverInfo: {},
    images: [],
    user: { name: "Student" },
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
});

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}

// create content
const App = (state) => {
    const data = state.toObject();

    const roverInfo = data.roverInfo.toObject();
    const images = data.images.toArray();

    return `
        <div id="apiOutput">
            <div id="roverInfo">
                ${displayRoverInfo(roverInfo)}
            </div>
            <div id="images">
                ${displayImages(images)}
            </div>
        </div>
    `;
};

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store);
});

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)
    console.log(photodate.getDate(), today.getDate());

    console.log(photodate.getDate() === today.getDate());
    if (!apod || apod.date === today.getDate() ) {
        getImageOfTheDay(store)
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    }
}

// ------------------------------------------------------  API CALLS

// Example API call
const getRoverInfoAndImages = rover => {
    fetch(`http://localhost:3000/rovers?rover=${rover}`)
        .then(res => res.json())
        .then(data => {
            const photos = List(data.photos);
            const { name, status, launch_date, landing_date } = data.photos[0].rover;
            const roverInfo = Map({
                name,
                status,
                launch_date,
                landing_date
        });
        const images = List(photos.map(photo => photo.img_src))
        updateStore(store, {roverInfo, images});
    });
};
