const { Map, List } = require ('immutable');
import './assets/stylesheets/index.css';
import './assets/stylesheets/resets.css';

const store = Immutable.Map({
    roverInfo: Immutable.Map({}),
    images: []
});

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = store.merge(newState);
    render(root, store);
}

const render = async (root, state) => {
    root.innerHTML = App(state);
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

const form = document.getElementById('form');
form.addEventListener('submit', e => {
    e.preventDefault();
    const select = document.getElementById('rovers');
    const rover = select.options[select.selectedIndex].value;
    getRoverInfoAndImages(rover);
})
// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store);
});

// ------------------------------------------------------  COMPONENTS

const showRoverInfo = roverInfo => {
    return `
      <div>
        <p>Rover Name: ${roverInfo.name}</p>
        <p>Launch Date: ${roverInfo.launch_date}</p>
        <p>Landing Date: ${roverInfo.landing_date}</p>
        <p>Status: ${roverInfo.status}</p>
      </div>
    `;
  };

  const showImages = images => {
    let imagesSliced;
  
    if (images.length > 6) {
      imagesSliced = images.slice(0, 6);
    } else {
      imagesSliced = images;
    }
  
    const imgs = imagesSliced.map(image => {
      return `
        <img src="${image}" height="200px" width="200px" />
      `;
    });
    return imgs;
  };

// ------------------------------------------------------  API CALLS

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
