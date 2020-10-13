const map = Immutable.Map({
    loader: "",
    tab: "pod",
    rovers: ["curiosity", "opportunity", "spirit"],
    roverData: null,
    roverPhotos: []
});

// add our markup to the page
const root = document.getElementById('root');

const updateStore = (storeParam, newState) => {
    const store = storeParam.merge(newState);
    render(root, store);
}

const render = async (rootParam, state) => {
    rootParam.innerHTML = App(state);
}

function setTab(tab) {
  const store = map.set('tab', tab);
  render(root, store);
}

function RoverImages(imgArray) {
  const output = imgArray.map(
    img => `<img src="${img}" height="350px" width="100%" />`
  );
  return output.join('');
}

// ------------------------------------------------------  API CALLS
const getRoverInfo = (rover, state) => {
    fetch(`http://localhost:3000/rover/`)
        .then(response => response.json())
        .then(r => {
          const roversByName = {
          };
  
          r.rovers.forEach(roverPram => {
            roversByName[roverPram.name.toLowerCase()] = roverPram;
          });
    
          const { max_date: maxDate } = roversByName[rover];
          fetch(`http://localhost:3000/rover/${rover}/${maxDate}`)
            .then(response => response.json())
            .then(roverPhotos => {
              updateStore(state, {
                roverData: roversByName[rover],
                roverPhotos: roverPhotos.photos.map(photo => photo.img_src),
              });
            });
        });
};


// ------------------------------------------------------  COMPONENTS
const Starter = loader => {
  if (
    (!loader)) {
      return `
          <h1 class="loader">Click on tabs to recieve images</h1>
      `;
    }
};

const RoverData = (rover, state) => {
  if (RoverData._called !== rover) {
    RoverData._called = rover;
    getRoverInfo(rover, state);
  }
  if (!state.get('roverData') || !state.get('roverPhotos').size) {
    return `<h1 class="loader">Loading...</h1>`;
  }
  return `
    <nav class="navbar">
      <h1>${state.getIn(['roverData', 'name'])}</h1>
      <ul class="main-nav">
        <li>Launch date ${state.getIn(['roverData', 'launch_date'])}</li>
        <li>Landing date  ${state.getIn(['roverData', 'landing_date'])}</li>
        <li>Status ${state.getIn(['roverData', 'status'])}</li>
        <li>Most recent photos taken on ${state.getIn(['roverData', 'max_date'])}</li>
      </ul>
      ${RoverImages(state.get('roverPhotos').toJS())}
    </nav>
    `;
};

// create content
const App = state => {
    const stateObjects = state.toJS();
    const { rovers, tab, loader } = stateObjects;
    const activeRovers = rovers.filter(name => tab === name.toLowerCase());

    return `
      <button class="tablink" onclick="setTab('curiosity')">Curiosity</button>
      <button class="tablink" onclick="setTab('opportunity')">Opportunity</button>
      <button class="tablink" onclick="setTab('spirit')">Spirit</button>
        ${
          activeRovers[0]
          ? RoverData(activeRovers[0].toLowerCase(), state) : Starter(loader)
        }
    `;
};

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, map);
});
