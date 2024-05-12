// Data for the first chart (My Preferred Allocation)
var myChartData = {
    labels: ['Category 1', 'Category 2', 'Category 3'],
    datasets: [{
        data: [30, 30, 40], // Example data
        backgroundColor: ['red', 'blue', 'green'] // Example colors
    }]
};

// Options for the first chart
var myChartOptions = {
    // Add options here if needed
};

// Create the first chart
var myChart = new Chart(document.getElementById('myChart'), {
    type: 'pie',
    data: myChartData,
    options: myChartOptions
});

// Data for the second chart (Current Actual Allocation)
var currentChartData = {
    labels: ['Category A', 'Category B', 'Category C'],
    datasets: [{
        data: [40, 30, 30], // Example data
        backgroundColor: ['orange', 'purple', 'yellow'] // Example colors
    }]
};

// Options for the second chart
var currentChartOptions = {
    // Add options here if needed
};

// Create the second chart
var currentChart = new Chart(document.getElementById('currentChart'), {
    type: 'pie',
    data: currentChartData,
    options: currentChartOptions
});
