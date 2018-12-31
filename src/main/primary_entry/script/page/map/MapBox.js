
const token = 'pk.eyJ1Ijoic3VwZXJjaGFyZ2UtaW5mbyIsImEiOiJjam9zM3cyenQwbW5lM2ttbzg0NnYzaDBoIn0.DDBRgKXWVkOcXBa1SQxLaA';

const MabBox = {

    accessToken: token,

    url: `https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=${token}`,

    attributionText: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
};

export default MabBox;