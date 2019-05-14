var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

const WATCH = false;

gulp.task("build", function () {    
    if(WATCH){
        gulp.watch('./src/**/*.ts', ['build']);        
    }
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("./dist"));
});

if(WATCH){
    gulp.task('default', ['build']);
}