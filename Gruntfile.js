module.exports = function(grunt) {

    var fs = require('fs');

    // concatListの取得
    var concatFile = fs.readFileSync('concat.json');
    var concatList = new Function('return ' + concatFile.toString())();

    grunt.initConfig({

        // パス定義
        paths: {
            js_src: 'assets/js_src',
            js_dev: 'assets/js_dev',
            js: 'assets/js',
            css_src: 'assets/css_src',
            css_dev: 'assets/css_dev',
            css: 'assets/css',
            image: 'assets/images'
        },

        pkg: grunt.file.readJSON('package.json'),

        // 実行コマンド
        exec: {
            // js_devディレクトリ削除コマンド
            remove_js_dev: {
                command: 'rm -rf <%= paths.js_dev %>',
                stdout: true
            },
            // jsディレクトリ削除コマンド
            remove_js: {
                command: 'rm -rf <%= paths.js %>',
                stdout: true
            },
            // css_devディレクトリ削除コマンド
            remove_css_dev: {
                command: 'rm -rf <%= paths.css_dev %>',
                stdout: true
            },
            // cssディレクトリ削除コマンド
            remove_css: {
                command: 'rm -rf <%= paths.css %>',
                stdout: true
            }
        },

        // js, css結合
        concat: concatList,

        // jsコードチェック
        jshint:{
            src: ['<%= paths.js_src %>'],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        // js圧縮
        uglify: {
            options: {
                // ライセンスのコメントを残す
                preserveComments: 'some'
            },
            js: {
                expand: true,
                cwd: '<%= paths.js_dev %>',
                src: '**/*.js',
                dest: '<%= paths.js %>'
            }
        },

        // scssコンパイル
        sass: {
            options: {
                includePaths: ['scss'],
                outputStyle: 'nested'
            },
            scss: {
                expand: true,
                cwd: '<%= paths.css_src %>',
                src: '**/*.scss',
                dest: '<%= paths.css_dev %>',
                ext: '.css'
            }
        },

        // css圧縮
        cssmin: {
            css: {
                expand: true,
                cwd: '<%= paths.css_dev %>',
                src: '**/*.css',
                dest: '<%= paths.css %>',
                ext: '.css'
            }
        },

        // 画像減色
        image: {
            image: {
                expand: true,
                cwd: '<%= paths.image %>',
                src: '**/*.{png,jpg,gif}',
                dest: '<%= paths.image %>'
            }
        },

        // js, css変更監視
        watch: {
            // リロード機能使うにはこのChrome Extensionいれる
            // https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei
            options: {
                debounceDelay: 250
            },
            js: {
                files: '<%= paths.js_src %>/**/*.js',
                tasks: ['jshint', 'release-dev']
            }
        }
    });

    // ビルド環境(local, jenkins)
    var env = grunt.option('env') || 'local';

    // load npm tasks

    // CIツールでのジョブ実行に必要なタスク
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    // ローカルでのみ必要なタスク
    if (env === 'local') {
        grunt.loadNpmTasks('grunt-image');
        grunt.loadNpmTasks('grunt-contrib-watch');
        grunt.loadNpmTasks('grunt-contrib-jshint');
    }

    // register task
    grunt.registerTask('release-dev', ['exec:remove_js_dev', 'exec:remove_css_dev', 'sass', 'concat']);
    grunt.registerTask('release-pub', ['exec:remove_js', 'exec:remove_css', 'release-dev', 'uglify', 'cssmin']);
    grunt.registerTask('default', ['release-dev']);

};
