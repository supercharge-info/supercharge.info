## Deployment of the supercharge.info frontend

### Deploying after features have been merged into master

Ensure you have a version of nodejs installed and in your path. The exact version of nodejs doesn’t matter too much, as it is only used to bundle not as a runtime env, etc.

After merging any feature branches and pulling down the current head, prep the repository for a release, download dependencies, and create a release branch:

    $ npm run clean
    $ npm install
    $ git checkout -b release

Increment the version number:

    $ npm version --message 'RELEASE: %s' <major|minor|patch>

Push the release branch and new tag to your fork:

    $ git push <your fork> release --tags

Create a pull request to upstream master for the above branch to include the new version number and tag.

Build the bundle for a browser:

     $ npm run build

Deploy: 

    $ ./deploy.sh <test|prod>

The version at the bottom of the about page should now match the version created in step 3 above.


### Checking out a Github pull request for testing

It can be useful to deploy submitted pull requests to test.supercharge.info for testing purposes.

For a repository with two remotes, where "upstream" points to the project's primary repository, and "origin" points to your fork:

    $ git remote -v
    origin	git@github.com:<yourgithubaccount>/supercharge.info.git (fetch)
    origin	git@github.com:<yourgithubaccount>/supercharge.info.git (push)
    upstream	git@github.com:supercharge-info/supercharge.info.git (fetch)
    upstream	git@github.com:supercharge-info/supercharge.info.git (push)

For a Github pull request with id 67 to merge a branch named "site-filters":

    $ git fetch upstream pull/67/head:site-filters
    remote: Enumerating objects: 577, done.
    remote: Counting objects: 100% (530/530), done.
    remote: Compressing objects: 100% (177/177), done.
    remote: Total 450 (delta 294), reused 391 (delta 235), pack-reused 0
    Receiving objects: 100% (450/450), 417.44 KiB | 155.00 KiB/s, done.
    Resolving deltas: 100% (294/294), completed with 54 local objects.
    From github.com:supercharge-info/supercharge.info
     * [new ref]         refs/pull/67/head -> site-filters

The branch name at the end of `pull/67/head:site-filters` does not need to match the name of the branch from the pull request, but it helps to keep your local branches organized.

Now checkout the branch from the pull request:

    $ git checkout site-filters 
    Switched to branch 'site-filters'

