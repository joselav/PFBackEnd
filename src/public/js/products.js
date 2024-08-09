document.addEventListener('DOMContentLoaded', () => {
    const filterSubmit = document.getElementById('filterSubmit');

    filterSubmit.addEventListener('click', (event) => {
        event.preventDefault();

        const sort = document.getElementById('Sort').value;
        const category = document.getElementById('Category').value;

        const queryParams = new URLSearchParams();
        if (sort) queryParams.append('sort', sort);
        if (category) queryParams.append('category', category);

        const queryString = queryParams.toString();
        window.location.href = `/products${queryString ? '?' + queryString : ''}`;
    });
});