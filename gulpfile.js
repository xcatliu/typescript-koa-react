const gulp = require('gulp');
const ts = require('gulp-typescript');
const pm2 = require('pm2');
const runSequence = require('run-sequence');

const pkg = require('./package.json');

const appName = pkg.name;

gulp.task('default', (callback) => {
    runSequence('build', 'serve', () => {
        gulp.watch('src/**/*', ['build']);
        gulp.watch('lib/**/*', ['serve']);
        console.log('Watching lib');
        callback();
    });
});


gulp.task('build', (callback) => {
    gulp.src('src/**/*.ts')
        .pipe(ts({
            lib: [
                'es2015'
            ]
        }))
        .pipe(gulp.dest('lib'))
        .on('end', callback);
});

gulp.task('serve', async () => {
    await new Promise((resolve, reject) => {
        pm2.connect((err) => {
            if (err) {
                console.error(err);
                process.exit(2);
            }
            resolve();
        });
    });
    const isAppStarted = await new Promise((resolve, reject) => {
        pm2.describe(appName, (err, processDescription) => {
            if (err) {
                console.error(err);
                process.exit(2);
            }
            if (processDescription.length === 0) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });

    if (isAppStarted) {
        pm2.restart(appName, (err, apps) => {
            console.log(`Restarted ${appName}`);
            pm2.disconnect();   // Disconnects from PM2
            if (err) throw err;
        });
        return;
    }
    pm2.start({
        name: appName,
        script: 'lib/app.js',        // Script to be run
        exec_mode: 'cluster',        // Allows your app to be clustered
        instances: 4,                // Optional: Scales your app by 4
        max_memory_restart: '100M'   // Optional: Restarts your app if it reaches 100Mo
    }, (err, apps) => {
        console.log(`Started ${appName}`);
        pm2.disconnect();   // Disconnects from PM2
        if (err) throw err;
    });
});

// process.on('SIGINT', async () => {
//     await new Promise((resolve, reject) => {
//         pm2.connect((err) => {
//             if (err) {
//                 console.error(err);
//                 process.exit(2);
//             }
//             resolve();
//         });
//     });

//     pm2.stop(appName, (err) => {
//         if (err) {
//             console.error(err);
//             process.exit(2);
//         }
//         console.log(`Stopped ${appName}`);
//         process.exit(0);
//     });
// });
