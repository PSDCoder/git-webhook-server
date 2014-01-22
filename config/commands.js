module.exports = {
//    hardReset: 'git reset --hard HEAD',
//    clean: 'git clean -f -d',
//    pull: 'git pull origin **branch**',

    hardReset: '',
    clean: '',
    pull: '',

    notify: 'echo "**message**" | mail **email** -s "**serverName** notification. Date: ' + new Date().toString() + '"'
};