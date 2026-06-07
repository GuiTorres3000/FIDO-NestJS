import './styles/main.scss';

console.log('Frontend application initialized');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');

  fetch('/api/v1')
    .then(response => response.text())
    .then(data => {
      console.log('Backend response:', data);
      const appDiv = document.getElementById('app');
      if (appDiv) {
        const apiStatus = document.createElement('p');
        apiStatus.textContent = `Backend says: ${data}`;
        apiStatus.style.color = 'green';
        appDiv.appendChild(apiStatus);
      }
    })
    .catch(error => {
      console.error('Error connecting to backend:', error);
      const appDiv = document.getElementById('app');
      if (appDiv) {
        const apiStatus = document.createElement('p');
        apiStatus.textContent = 'Error connecting to backend';
        apiStatus.style.color = 'red';
        appDiv.appendChild(apiStatus);
      }
    });
});
