let tbody = document.querySelector("#bingo tbody");

let divisors = getBestDivisors(ELEMENTS.length)

let remainingElements = ELEMENTS.slice()

function init() {
    const urlParams = new URLSearchParams(window.location.search);
    let savedOrder = urlParams.get('order'); 

    if (!savedOrder) {
        let shuffledIndices = shuffleArray([...ELEMENTS].map((_, index) => index)); 
        updateUrlOrder(shuffledIndices); 
        savedOrder = shuffledIndices;
    } else {
        try {
            savedOrder = atob(savedOrder).split(',').map(Number); // Decode Base64 and convert back to numbers
        } catch (e) {
            console.error("Error decoding Base64 order:", e);
            return;
        }
    }

    if (!Array.isArray(savedOrder) || savedOrder.some(isNaN)) {
        console.error("Error: 'savedOrder' is not a valid array of numbers", savedOrder);
        return; 
    }

    let orderedElements = savedOrder.map(index => ELEMENTS[index]);
    
    let elementIndex = 0;
    for (let i = 0; i < divisors.min; i++) {
        let tr = document.createElement("tr");
        for (let j = 0; j < divisors.max; j++) {
            let element = orderedElements[elementIndex];
            let td = document.createElement("td");
            td.appendChild(document.createTextNode(element));
            tr.appendChild(td);

            td.active = 0;
            td.addEventListener('click', toggleElement);

            elementIndex++;
        }
        tbody.appendChild(tr);
    }

    document.querySelector("#golden").addEventListener('click', () => {
        let remainingElements = [];
        for (let td of all()) {
            if (!isClicked(td))
                remainingElements.push(td);
        }

        let element = remainingElements.splice(randomIndex(remainingElements), 1);

        if (element.length > 0)
            toggleElement.apply(element[0], null);
    });

	document.querySelector("#reroll").addEventListener('click', () => {
		let newOrder = shuffleArray([...ELEMENTS].map((_, index) => index)); 
		updateUrlOrder(newOrder); 
		location.reload();
	});
}


function shuffleArray(array) {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; 
    }
    return shuffled;
}

function updateUrlOrder(order) {
    const encodedOrder = btoa(order.join(',')); // Convert to string and encode in Base64
    const url = new URL(window.location);
    url.searchParams.set('order', encodedOrder);
    window.history.replaceState({}, '', url);
}



init()

let tds = []

tbody.querySelectorAll('tr').forEach(element => {
	tds.push(element.querySelectorAll('td'))
})

function toggleElement(){
	forEachAlignement(this, !isClicked(this))
}

function getBestDivisors(n) {
	for(let i = Math.ceil(Math.sqrt(n)); i < n; i++) {
		if(n%i == 0)
			return {min: n/i, max: i};
	}

	return {min: 1, max: n}
}

function randomIndex(array) {
	return Math.floor(Math.random() * array.length)
}

function isDefault(element) {
	return element.className === ""
}

function setDefault(element) {
	element.className = ""
}

function setActive(element) {
	element.className = "table-active"
}

function isActive(element) {
	return element.className === "table-active"
}

function setSuccess(element) {
	element.className = "table-success"
}

function isSuccess(element) {
	return element.className === "table-success"
}

function isClicked(element) {
	return element.className === "table-success" || isActive(element)
}



function forEachAlignement(element, active) {
	if(active)
		setSuccess(element)
	else
		setDefault(element)
	
	
	for(let x = 0; x < divisors.max; x++){
		processAlignment(column.bind(this, x))
	}
	
	
	for(let y = 0; y < divisors.min; y++){
		processAlignment(line.bind(this, y))
	}

	
	if(divisors.min == divisors.max) {
		
		processAlignment(diagonal)
		
		
		processAlignment(antiDiagonal)
	}	
	
	

	for(let current of all()) {
		if(current.active == 0 && isActive(current))
			setSuccess(current)
		current.active = 0
	}

}



function* all() {
	for(let i = 0; i < divisors.max; i++) {
		for(let j = 0; j < divisors.min; j++) {
			yield tds[j][i]
		}
	}
}

function* diagonal() {
	for(let i = 0; i < divisors.max; i++) {
		yield tds[i][i]
	}
}

function* antiDiagonal() {
	for(let i = 0; i < divisors.max; i++) {
		yield tds[i][divisors.max - i - 1]
	}
}

function* line(y) {
	for(let i = 0; i < divisors.max; i++) {
		yield tds[y][i]
	}
}

function* column(x) {
	for(let i = 0; i < divisors.min; i++) {
		yield tds[i][x]
	}
}

function processAlignment(generator) {
	let activeCount = 0
	let max = 0
	for(let current of generator()) {
		if(isClicked(current))
			activeCount++
		max++
	}
	for(let current of generator()) {
		if(activeCount == max){
			setActive(current)
			current.active++
		}
	}
}


function printActive() {
	let str = ''
	for(const tr of tds){
		for(const td of tr){
			str+=td.active+' '
		}
		str+='\n'
	}
}
