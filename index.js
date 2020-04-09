const oldRelease = 'xxxx';  // Old Release branch or tag name like releasesxx
const newRelease = 'xxxx'; // New Release branch or tag name like releasesxxx

const USER = ""; // Git username
const PASS = ""; // GIT password
const basepath = 'github.com/xxx/'; // GIT base path  -- Need to change
const repos = ["REPOONE", "REPOTWO", "REPOTHREE", "REPOFOUR"]; // Multi repo can be provided like repo1, repo2 etc. 

const git = require('simple-git/promise');
const fs = require("fs");
const _ = require('underscore');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);



const remotePath = `https://${USER}:${PASS}@`;


//Clone repo function. Takes pull if folder already exists
const cloneRepo = async (repo) => {
    const remote = remotePath + basepath + repo; 

    try{
        await git().silent(true).clone(remote);
        console.log("Cloned",  remote);
        return;        
    }catch(err){
        console.log("ERROR Cloning directory exists, updating same",  remote);
        await git(repo).silent(true).pull();
        return;
    }
}

//Find difference between two releases
const findDiff = async (repo) => {
    await git(repo).silent(true).checkout(oldRelease);
    await git(repo).silent(true).checkout(newRelease);    
    return await git(repo).silent(true).log(oldRelease, newRelease);    
}

//Format response and write to files in results folder
const formatResponse = async (repo, diff) => {    
    const diffJson = JSON.parse(JSON.stringify(diff));
    const resp = _.pluck(diffJson.all, 'message');

    try{
        await writeFileAsync(`results/${repo}.txt`, resp.join("\n"));
    }catch(err){
        console.log("Error in repo : ", repo, "\n", err);
    }
    console.log(resp.join("\n"));

    return;
}

//Main Function 
const main = async () => {

repos.forEach(async (repo) => {

    await cloneRepo(repo);    
    const diff = await findDiff(repo);
    await formatResponse(repo, diff);

});

    
}

main();
