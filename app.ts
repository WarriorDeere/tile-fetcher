import 'dotenv/config';
import http from 'http';
import fs from 'fs';
import path from 'path';

const API_KEY = process.env.API_KEY;

interface Coordinates {
    lat: number
    lng: number
}

function fetchTile(coords: Coordinates[]) {
    const zoom: number = 15;

    coords.forEach((coord, idx) => {
        const { lat, lng } = coord;
        const tileCoord = coordsToTile(lat, lng, zoom);

        const filePath = path.join(__dirname, 'out', `tile_${idx}.jpg`);
        const dirPath = path.dirname(filePath);
        fs.mkdirSync(dirPath, { recursive: true });

        const url = `http://api.tomtom.com/map/1/tile/sat/main/${zoom}/${tileCoord.tile_x}/${tileCoord.tile_y}.jpg?key=${API_KEY}`;
        const request = http.get(url, (r) => {
            const fileStream = fs.createWriteStream(filePath);
            r.pipe(fileStream);

            r.on('end', () => {
                console.log(`[INFO] Fetched Image Successfully to ${filePath}`);
            })
        });

        request.on('error', (e) => {
            throw new Error(`[ERROR] ${e}`);
        });
    });
}

function coordsToTile(lat: number, lng: number, zoom: number): { tile_x: number, tile_y: number } {
    const tileSize = 256;

    function latLngToPx(lat: number, lng: number, zoom: number): { x: number, y: number } {
        const pi = Math.PI;
        const latRad = lat * pi / 180;
        const n = 2.0 ** zoom;
        const x = (lng + 180.0) / 360.0 * n * tileSize;
        const y = (1.0 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / pi) / 2.0 * n * tileSize;
        return { x, y };
    }

    function pxToTile(px: { x: number, y: number }): { tile_x: number, tile_y: number } {
        const tileX = Math.floor(px.x / tileSize);
        const tileY = Math.floor(px.y / tileSize);
        return { tile_x: tileX, tile_y: tileY }
    }

    const pxCoords = latLngToPx(lat, lng, zoom);
    const tileCoords = pxToTile(pxCoords);

    return tileCoords;
}

const fcrd: Coordinates[] = [
    { lat: 52.776969, lng: 11.626134 },
    { lat: 52.639827, lng: 11.79509 },
    { lat: 52.490334, lng: 12.164017 },
    { lat: 53.561429, lng: 12.818514 },
    { lat: 49.710396, lng: 11.269056 },
    { lat: 49.41394, lng: 12.606031 },
    { lat: 50.579135, lng: 12.965492 },
    { lat: 51.222271, lng: 14.756783 },
]

// fetchTile(fcrd);