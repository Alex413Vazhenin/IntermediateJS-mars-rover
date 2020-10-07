const map = Immutable.Map({
    apod: "",
    tab: "pod",
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

function RoverImages(imgArray) {
  const output = imgArray.map(
    img => `<img src="${img}" height="350px" width="100%" />`
  );
  return output.join('');
}

// ------------------------------------------------------  API CALLS
const getImageOfTheDay = state => {
  const stateObjects = state.toJS();
  const { apod } = stateObjects;

  fetch(`http://localhost:3000/apod/`)
    .then(res => res.json())
    .then(apod => {
      updateStore(state, { apod });
  });
};

const getRoverInfoAndImages = (rover, state) => {
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
            .then(images => {
              updateStore(state, {
                roverData: roversByName[rover],
                images: images.photos.map(photo => photo.img_src),
              });
            });
        });
};


// ------------------------------------------------------  COMPONENTS
const ImageOfTheDay = apod => {
  const currentDate = new Date();
  const imageDate = new Date(apod.date);
  if (
    (!apod || imageDate === currentDate.getDate()) && !ImageOfTheDay._imagesRequested) {
      ImageOfTheDay._imagesRequested = true;
      getImageOfTheDay(map);
    }

    if (!apod) {
      return `<h1>Loading...</h1>`;
    }
    // check if the photo of the day is actually type video!
    if (apod.media_type === 'video') {
      return `
        <div id="pod" class="tabcontent">
          <p>See today's featured video <a href="${apod.image.url}">here</a></p>
          <p>${apod.title}</p>
          <p>${apod.explanation}</p>
        </div>
        `;
    }

    return `
    <div id="pod" class="tabcontent">
        <img src="${apod.image.url}" height="350px" width="100%" />
        <p>${apod.image.explanation}</p>
    </div>            
    `;
};

const RoverData = (rover, state) => {
  if (RoverData._called !== rover) {
    RoverData._called = rover;
    getRoverData(rover, state);
  }
  if (!state.get('roverData') || !state.get('images').size) {
    return `<h1>Loading...</h1>`;
  }
  return `
    <div class="tabcontent">
      <h1>${state.getIn(['roverData', 'name'])}</h1>
      <ul>
        <li>Launch date ${state.getIn(['roverData', 'launch_date'])}</li>
        <li>Landing date  ${state.getIn(['roverData', 'landing_date'])}</li>
        <li>Status ${state.getIn(['roverData', 'status'])}</li>
        <li>Most recent photos taken on ${state.getIn(['roverData', 'max_date'])}</li>
      </ul>
      ${RoverImages(state.get('images').toJS())}
      </div>
      `;
};

// create content
const App = state => {
    const stateObjects = state.toJS();
    const { rovers, tab, apod } = stateObjects;
    const activeRovers = rovers.filter(name => tab === name.toLowerCase());

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



// const displayRoverInfo = roverInfo => {
//     return `
//       <div>
//         <p>Rover Name: ${roverInfo.name}</p>
//         <p>Launch Date: ${roverInfo.launch_date}</p>
//         <p>Landing Date: ${roverInfo.landing_date}</p>
//         <p>Status: ${roverInfo.status}</p>
//       </div>
//     `;
//   };