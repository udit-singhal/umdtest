let scores={};

async function getScoresData() {
  const response = await fetch("problem2.json"); // Adjust the path to your JSON file
  scores = await response.json();
  console.log(scores)
}

getScoresData();

const loader = document.querySelector('.loading');
setTimeout(()=>{
    loader.style.opacity = "0";
    loader.style.visibility = "hidden";
}, 2000);


const imageGrid = document.getElementById("image-grid");
const metricValue = document.getElementById("metric-value");
let selectedImages = [];

function updateMetric() {
  const selectedScores = selectedImages.map((image) => scores[image]);
  const nonSelectedImages = Object.keys(scores).filter(
    (image) => !selectedImages.includes(image)
  );
  const nonSelectedScores = nonSelectedImages.map((image) => scores[image]);

  const selectedAverage = selectedScores.length
    ? selectedScores.reduce((a, b) => a + b, 0) / selectedScores.length
    : 0;
  const nonSelectedAverage = nonSelectedScores.length
    ? nonSelectedScores.reduce((a, b) => a + b, 0) / nonSelectedScores.length
    : 0;

    if(selectedScores.length==0 || nonSelectedScores.length==20){
        metricValue.textContent = 0.00
    } else{
        const metric = selectedAverage - nonSelectedAverage;
        metricValue.textContent = metric.toFixed(2);
      
    }
}
let currentSelectedImage = null;

function toggleSelection(image) {
  if (selectedImages.includes(image)) {
    selectedImages = selectedImages.filter((selected) => selected !== image);
    
  } else {
    selectedImages.push(image);
  }

  updateMetric();
}

function createImageElement(image) {
    const img = document.createElement('img');
    img.classList.add('image');
    img.src = `${image}`;
    img.alt = image;
    
    img.addEventListener('click', () => {
        toggleSelection(image);
        img.classList.toggle('selected'); // Toggle the selected class on click
        img.style.transition = 'none'; // Disable the hover transition
        setTimeout(() => {
            img.style.transition = ''; // Re-enable the hover transition after a short delay
        }, 10);
    });

    return img;
}

function createCheckMark() {
    const checkmark = document.createElement('div');
    checkmark.classList.add('checkmark');
    checkmark.textContent = '✓';
    return checkmark;
}



// Add images to the grid
setTimeout(()=>{
    const imageFiles = Object.keys(scores);
    imageFiles.forEach(image => {
    const imageElement = createImageElement(image);
    imageGrid.appendChild(imageElement);
    })
},2000);
