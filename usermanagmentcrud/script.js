class Person {
    constructor(name, address, email, phone_number, birthdate) {
        this.name = name;
        this.address = address;
        this.email = email;
        this.phone_number = phone_number;
        this.birthdate = new Date(birthdate);
    }

    calcAge() {
        const today = new Date();
        let age = today.getFullYear() - this.birthdate.getFullYear();
        const monthDifference = today.getMonth() - this.birthdate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < this.birthdate.getDate())) {
            age--;
        }
        return age;
    }
}

class User extends Person {
    constructor(id, name, address, email, phone_number, birthdate, job, company) {
        super(name, address, email, phone_number, birthdate);
        this.id = id;
        this.job = job;
        this.company = company;
    }

    isRetired() {
        return this.calcAge() > 65;
    }
}

const users = [];
let currentPage = 1;
const recordsPerPage = 10;
const apiUrl = 'https://api.npoint.io/9cda598e0693b49ef1eb';

function fetchData() {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            users.length = 0; 
            data.forEach(user => {
                users.push(new User(user.id, user.name, user.address, user.email, user.phone_number, user.birthdate, user.job, user.company));
            });
            displayUsers();
        })
        .catch(error => console.error('Error fetching data:', error));
}

function getFilteredUsers() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    return users.filter(user => 
        user.name.toLowerCase().includes(searchQuery) || 
        user.email.toLowerCase().includes(searchQuery)
    );
}

function displayUsers() {
    const usertbody = document.getElementById('table-body');
    usertbody.innerHTML = '';
    const filteredUsers = getFilteredUsers();
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = Math.min(startIndex + recordsPerPage, filteredUsers.length);

    for (let i = startIndex; i < endIndex; i++) {
        const user = filteredUsers[i];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.address}</td>
            <td>${user.email}</td>
            <td>${user.phone_number}</td>
            <td>${user.job}</td>
            <td>${user.company}</td>
            <td>${user.calcAge()}</td>
            <td>${user.isRetired()}</td>
            <td>
                <button class="btn btn-warning" onclick="editUser(${user.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteUser(${user.id})">Delete</button>
            </td>
        `;
        usertbody.appendChild(row);
    }
    document.getElementById('pagination-info').textContent = `Page ${currentPage} of ${Math.ceil(filteredUsers.length / recordsPerPage)}`;
}

function openModal(user = null) {
    const modal = new bootstrap.Modal(document.getElementById('user-modal'));
    if (user) {
        document.getElementById('modal-title').innerText = 'Edit User';
        document.getElementById('user-id').value = user.id;
        document.getElementById('name').value = user.name;
        document.getElementById('address').value = user.address;
        document.getElementById('email').value = user.email;
        document.getElementById('phone_number').value = user.phone_number;
        document.getElementById('job').value = user.job;
        document.getElementById('company').value = user.company;
        document.getElementById('birthdate').value = user.birthdate;
    } else {
        document.getElementById('modal-title').innerText = 'Add User';
        document.getElementById('user-form').reset();
    }
    modal.show();
}

function saveUser(event) {
    event.preventDefault();
    const id = document.getElementById('user-id').value;
    const name = document.getElementById('name').value;
    const address = document.getElementById('address').value;
    const email = document.getElementById('email').value;
    const phone_number = document.getElementById('phone_number').value;
    const job = document.getElementById('job').value;
    const company = document.getElementById('company').value;
    const birthdate = document.getElementById('birthdate').value;

    const userData = {
        name,
        address,
        email,
        phone_number,
        job,
        company,
        birthdate
    };

    if (id) {
        fetch(`${apiUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })
        .then(response => {
            if (response.ok) {
                Swal.fire('Success', 'User updated successfully', 'success');
                fetchData();
            } else {
                Swal.fire('Error', 'Failed to update user', 'error');
            }
        })
        .catch(error => console.error('Error updating user:', error));
    } else {
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })
        .then(response => {
            if (response.ok) {
                Swal.fire('Success', 'User added successfully', 'success');
                fetchData();
            } else {
                Swal.fire('Error', 'Failed to add user', 'error');
            }
        })
        .catch(error => console.error('Error adding user:', error));
    }

}

function editUser(id) {
    const user = users.find(user => user.id === id);
    if (user) {
        openModal(user);
    }
}

function deleteUser(id) {
    fetch(`${apiUrl}/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            Swal.fire('Deleted!', 'User has been deleted.', 'success');
            fetchData();
        } else {
            Swal.fire('Error!', 'Could not delete the user.', 'error');
        }
    })
    .catch(error => console.error('Error deleting user:', error));
}

function setupEventListeners() {
    document.getElementById('search-input').addEventListener('input', () => {
        currentPage = 1;
        displayUsers();
    });

    document.getElementById('previous-button').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayUsers();
        }
    });

    document.getElementById('next-button').addEventListener('click', () => {
        if (currentPage < Math.ceil(getFilteredUsers().length / recordsPerPage)) {
            currentPage++;
            displayUsers();
        }
    });

    document.getElementById('add-user-btn').addEventListener('click', () => openModal());

    document.getElementById('user-form').addEventListener('submit', saveUser);
}

fetchData();
setupEventListeners();
