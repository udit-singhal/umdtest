
let smoothingFactor = 1;
let selectedModels = [];
let losses = [];
let jsonData;
let confusionMatrices = [];
let radarData = [];
const modelLabels = ["Model 1", "Model 2", "Model 3", "Model 4", "Model 5"];
const checkboxes = [];

const buttons = document.querySelectorAll("[data-carousel-button]")

buttons.forEach(button =>{
    button.addEventListener("click",()=>{
        const offset = button.dataset.carouselButton === "next"? 1:-1
        const slides = button
        .closest("[data-carousel]")
        .querySelector("[data-slides]")

        const activeSlide = slides.querySelector("[data-active]")
        let newIndex = [...slides.children].indexOf(activeSlide) + offset
        if(newIndex < 0) newIndex = slides.children.length -1
        if(newIndex >= slides.children.length) newIndex = 0

        slides.children[newIndex].dataset.active = true
        delete activeSlide.dataset.active
    })
})

async function getJsonData(){
    const response = await fetch('problem1.json') // Adjust the path to your JSON file
    jsonData = await response.json()
    
}

getJsonData();

const loader = document.querySelector('.loading');
const content = document.querySelector('.carousel');
const smooth = document.querySelector('.features');
setTimeout(()=>{
    loader.style.opacity = "0";
    smooth.style.visibility = "visible"
    content.style.opacity = "1";
}, 2000)

smooth.style.visibility = "hidden"


setTimeout(()=>{
    losses = jsonData.losses
    confusionMatrices = jsonData.confusion_matrices
    radarData = jsonData.radar_data
    console.log(losses, confusionMatrices, radarData)
    selectedModels = Array(losses.length).fill(true);
    createLinePlot();
    createConfusionMatricesPlot();
    createRadarChart();

},2000)



//Function to create Line plot
function createLinePlot(){
    
    const smoothedLosses = losses.map((loss) => {
        return smoothData(loss, smoothingFactor);
    });

    const traces = [];

    for (let i = 0; i < losses.length; i++) {
        if (selectedModels[i]) {
            traces.push({
                x: Array.from({ length: smoothedLosses[i].length }, (_, j) => j),
                y: smoothedLosses[i],
                mode: 'lines',
                name: modelLabels[i],
            });
        }
    }

    const layout = {
        autosize: true,
        margin:{
           l:150
        },
        xaxis: {
            title: 'Steps',
            color: 'white'
        },
        yaxis: {
            title: 'Loss',
            color: 'white'
        },
        showlegend: true,
        title: {
            text: 'Line Plot for 5 Models',
            font: {
                family: 'Poppins, Arial, Verdana',
                size: '2.5rem',
                weight: 'bold',
                color: 'white',
              },
        },
        legend:{
            font: {
                family: 'Poppins, Arial, Verdana',
                size: '1rem',
                color: 'white'
              },
        },
        paper_bgcolor:'black',
        plot_bgcolor:'black'

    };

    Plotly.newPlot('plot', traces, layout, {responsive: true});

    // Update the legend
    // const lineLegendDiv = document.getElementById('legend-plot');
    // legendDiv.innerHTML = '';
    // legendDiv.innerHTML = '';
    checkboxes.length = 0; // Clear the checkboxes array
    
    modelLabels.forEach((label, index) => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = selectedModels[index];
        checkbox.addEventListener('change', () => {
            selectedModels[index] = checkbox.checked;
            createLinePlot();
        });
        const labelSpan = document.createElement('span');
        labelSpan.innerText = label;
        // const legendItem = document.createElement('div');
        // legendItem.appendChild(checkbox);
        // legendItem.appendChild(labelSpan);
        // lineLegendDiv.appendChild(legendItem);
        
        // Store checkboxes for Line Plot
        checkboxes.push(checkbox);
    });
}

// Function to apply smoothing to data
function smoothData(data, factor) {
    const smoothed = [];
    for (let i = 0; i < data.length; i++) {
        let sum = 0;
        let count = 0;
        for (let j = i - factor; j <= i + factor; j++) {
            if (j >= 0 && j < data.length) {
                sum += data[j];
                count++;
            }
        }
        smoothed.push(sum / count);
    }
    return smoothed;
}


// Add event listener to the smoothing slider
const smoothingSlider = document.getElementById('smoothing');
smoothingSlider.addEventListener('input', () => {
    smoothingFactor = parseInt(smoothingSlider.value);
    createLinePlot();
});


// Function to create a bar plot for confusion matrices
function createConfusionMatricesPlot() {
    const classAccuracies = calculateClasswiseAccuracies();

    const modelLabels = Array.from(new Set(classAccuracies.map(item => item.model))); // Get unique class labels
    const formattedData = [];
    // const barLegendDiv = document.getElementById('bar-legend-plot');
    // barLegendDiv.innerHTML = '';

    modelLabels.forEach(modelLabel => {
        const classNames = [];
        const accuracies = [];

        classAccuracies.forEach(item => {
            if (item.model === modelLabel) {
                classNames.push(item.class);
                accuracies.push(item.accuracy);
            }
        });

        formattedData.push({
            x: classNames,
            y: accuracies,
            name: modelLabel,
            type: 'bar',
            marker: {
                opacity: 0.7
            }
        });
    });


    console.log("this data needs to be changed",formattedData)
    const layout = {
        autosize: true,
        margin:{
           l:150
        },
        barmode: 'group',
        xaxis: { title: 'Models', color: 'white' },
        yaxis: { title: 'Accuracy', color: 'white' },
        title: {
            text: 'Classwise Accuracies for 5 Models',
            font: {
                family: 'Poppins, Arial, Verdana',
                size: '2.5rem',
                weight: 'bold',
                color: 'white',
              },
        },
        legend:{
            font: {
                family: 'Poppins, Arial, Verdana',
                size: '1rem',
                color: 'white'
              },
        },
        paper_bgcolor:'black',
        plot_bgcolor:'black',
    };

    Plotly.newPlot('confusion-matrices-plot', formattedData, layout, {responsive: true});
}

function calculateClasswiseAccuracies() {
    const modelLabels = ["Model 1", "Model 2", "Model 3", "Model 4", "Model 5"];
    const classLabels = ["Class #1", "Class #2"];
    const classAccuracies = [];

    for (let classIndex = 0; classIndex <classLabels.length; classIndex++) {


        for (let modelIndex = 0; modelIndex < confusionMatrices.length; modelIndex++) {
            const TP = confusionMatrices[modelIndex][classIndex][classIndex];
            const total = confusionMatrices[modelIndex][classIndex].reduce((a, b) => a + b, 0);
            const accuracy = TP / total;
            classAccuracies.push({accuracy: accuracy, model: modelLabels[modelIndex], class: classLabels[classIndex]});
        } 
        
    }
    console.log("data pushed",classAccuracies)
    return classAccuracies;
}

// Function to create a radar chart for radar data
function createRadarChart() {
    const modelLabels = ["Model 1", "Model 2", "Model 3", "Model 4", "Model 5"];
    const metricLabels = ["Metric #1", "Metric #2", "Metric #3", "Metric #4", "Metric #5"];
    // const radarLegendDiv = document.getElementById('radar-legend-plot');
    // radarLegendDiv.innerHTML = '';

    const data = modelLabels.map((model, index) => ({
        type: 'scatterpolar',
        r: radarData[index],
        theta: metricLabels,
        fill: 'toself',
        name: model
    }));

    const layout = {
        autosize: true,
        margin:{
           l:150
        },
        title: {
            text: 'Radar Chart for 5 Models',
            font: {
                family: 'Poppins, Arial, Verdana',
                size: '2.5rem',
                weight: 'bold',
                color: 'white',
              },
        },
        legend:{
            font: {
                family: 'Poppins, Arial, Verdana',
                size: '1rem',
                color: 'white'
              },
        },
        paper_bgcolor:'black',
        plot_bgcolor:'black',
        polar: {
            angularaxis: {color: 'white'},
            radialaxis: { visible: true, range: [0, 1.5], color: 'white' },
            bgcolor: 'black',
            font: {
                family: 'Poppins, Arial, Verdana',
                size: '1.5rem',
                weight: 'bold',
                color: 'white',
              },

        },

        showlegend: true,
    
    };

    Plotly.newPlot('radar-chart-plot', data, layout, {responsive: true});
}
