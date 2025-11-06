

export default MapApi({
    getCities: async () => {
        const response = await axios.get('http://localhost:8080/api/cities');
        return response.data;
    }
})