const map = Immutable.Map({
    rovers: ["curiosity", "opportunity", "spirit"],
    roverData: [],
    images: []
});

// add our markup to the page
const root = document.getElementById('root');

const updateStore = (store, newState) => {
    const newMap = store.merge(newState);
    render(root, newMap);
}

const render = async (root, state) => {
    root.innerHTML = App(state);
}

// create content
const App = state => {
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
    render(root, map);
});

// ------------------------------------------------------  COMPONENTS

const displayRoverInfo = roverInfo => {
    return `
      <div>
        <p>Rover Name: ${roverInfo.name}</p>
        <p>Launch Date: ${roverInfo.launch_date}</p>
        <p>Landing Date: ${roverInfo.landing_date}</p>
        <p>Status: ${roverInfo.status}</p>
      </div>
    `;
  };

  const displayImages = images => {
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
    fetch(`http://localhost:3000/rover/${rover}`)
        .then(res => res.json())
        .then((roverInfo) => {
          updateStore(store, {roverInfo});
          console.log(roverInfo);      
        });
};
