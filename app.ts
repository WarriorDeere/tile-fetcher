import 'dotenv/config';
import http from 'http';
import fs from 'fs';
import path from 'path';

const API_KEY = process.env.API_KEY;

function fetchTile() {
    const zoom: number = 15;
    const coord_x: number = 51.13;
    const coord_y: number = 14.83;

    const filePath = path.join(__dirname, 'out', 'tests', 'example_fetched.png');
    const dirPath = path.dirname(filePath);
    fs.mkdirSync(dirPath, { recursive: true });

    const tileCoords = coordsToTile(coord_x, coord_y, zoom);

    const url = `http://api.tomtom.com/map/1/tile/sat/main/${zoom}/${tileCoords.tile_x}/${tileCoords.tile_y}.jpg?key=${API_KEY}`;
    const request = http.get(url, (r) => {
        const fileStream = fs.createWriteStream(filePath);
        r.pipe(fileStream);

        r.on('end', () => {
            console.log(`[INFO] Fetched Image Successfully to ${filePath}`);
            processImage(filePath);
        })
    });

    request.on('error', (e) => {
        throw new Error(`[ERROR] ${e}`);
    });
}

function processImage(imagePath: string) {

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

fetchTile();