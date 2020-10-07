const map = Immutable.Map({
    apod: "",
    rovers: ["curiosity", "opportunity", "spirit"],
    roverData: [],
    images: []
});

// add our markup to the page
const root = document.getElementById('root');

const updateStore = (storeData, newState) => {
    const store = storeData.merge(newState);
    render(root, store);
}

const render = async (root, state) => {
    root.innerHTML = App(state);
}

function setTab(tab) {
  const store = map.set('tab', tab);
  render(root, store);
}

// create content
const App = state => {
    const stateObjects = state.toJS();
    const { rovers, tabs, apod } = stateObjects;
    const activeRovers = rovers.filter(name => tabs === name.toLowerCase());

    return `
      <button class="tablink" onclick="setTab('pod')">Image of the Day</button>
      <button class="tablink" onclick="setTab('curiosity')">Curiosity</button>
      <button class="tablink" onclick="setTab('opportunity')">Opportunity</button>
      <button class="tablink" onclick="setTab('spirit')">Spirit</button>

        ${
          activeRovers[0]
          ? roverInfo(activeRovers[0].toLowerCase(), state) : ImageOfTheDay(apod)
        }
    `;
};

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, map);
});

// ------------------------------------------------------  COMPONENTS
const ImageOfTheDay = apod => {
  const currentDate = new Date();
  const imageDate = new Date(apod.date);
  if (
    (!apod || imageDate === currentDate.getDate()) && !ImageOfTheDay._imagesRequested) {
      ImageOfTheDay._imagesRequested = true;
      getImageOfTheDay(map);
    }
}

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
const getImageOfTheDay = state => {
  const stateObjects = state.toJS();
  const { apod } = stateObjects;

  fetch(`http://localhost:3000/apod`)
    .then(res => res.json())
    .then(apod => {
      updateStore(state, { apod });
  });
};


const getRoverInfoAndImages = rover => {
    fetch(`http://localhost:3000/rover/${rover}`)
        .then(res => res.json())
        .then((roverInfo) => {
          updateStore(store, {roverInfo});
          console.log(roverInfo);      
        });
};
