const axios = require('axios')
const instance = axios.create({
    baseURL: 'https://api.github.com'})

function search(keywords, page, sort='stars', order='desc') {
    const search_string = 
        '/search/repositories?' + 
        'q=' + keywords.join('+') + 
        '&sort=' + sort +
        '&order=' + order +
        '&page=' + page +
        '&per_page=' + String(30)
    return instance.get(search_string)
}

function parse_response(response) {
    return (
        response.data.items.map(({
            full_name, 
            html_url, 
            stargazers_count, 
            description,
            language}) => ({
                full_name, 
                html_url, 
                description,
                stargazers_count, 
                language})))
}

function get_issues(repo) {
    const query_str = 'https://api.github.com/repos/' + repo + '/issues' + '?labels=good%20first%20issue'
    return instance.get(query_str)
}

function parse_issues(issues) {
    let new_issues = 
        issues.data.map(({title, labels, html_url}) => ({title, labels, html_url}))
    for (const issue of new_issues) {
        issue.labels = issue.labels.map(label=>label.name)
    }
    return new_issues
}

search(['pytorch'], 1).then(data=>console.log('FIRST SEARCH: ', data))
search(['pytorch'], 2).then(data=>console.log('SECOND SEARCH: ', data))

export { search, parse_response, get_issues, parse_issues }