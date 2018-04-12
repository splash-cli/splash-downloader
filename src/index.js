'use strict';

require('babel-polyfill');

import https from 'https';
import fs from 'fs';
import path, { 
	join
} from 'path';

import wallpaper from 'wallpaper';
import chalk from 'chalk';

import Ora from 'ora';
import Conf from 'conf';

import isMonth from '@splash-cli/is-month';
import parseExif from '@splash-cli/parse-exif';
import showCopy from '@splash-cli/show-copy';

const config = new Conf();
const spinner = new Ora({
	text: 'Making something awesome',
	color: 'yellow',
	spinner: isMonth('december') ? 'christmas' : 'earth'
});

// Flags, options, set as wallpaper
function download({
	quiet,
	info
} = {
	quiet: false
}, {
	custom,
	photo,
	filename
} = {
	custom: false
}, setAsWallpaper = true) {
	// Increase downloads counter.
	config.set('counter', config.get('counter') + 1);

	// If no progress run the spinner
	if (!quiet) {
		spinner.start();
	}

	const size = config.get('pic-size');
	const extension = size === 'raw' ? 'tiff' : 'jpg';
	const img = filename ? filename : join(config.get('directory'), `${photo.id}.${extension}`);
	const url = custom ? photo.urls.custom : (photo.urls[size] ? photo.urls[size] : photo.urls.full);
	const file = fs.createWriteStream(img);

	try {
		https.get(url, response => {
			response.pipe(file).on('finish', () => {
				if (setAsWallpaper) {
					wallpaper.set(img);
				}

				if (!quiet) {
					spinner.succeed();
				}

				// Display 'shot by ...'
				console.log();
				showCopy(photo, info);

				// Trailing space
				console.log();
			});
		});
	} catch (err) {
		throw new Error(err);
	}
}

module.exports = download;