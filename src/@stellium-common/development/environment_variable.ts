import * as path from 'path'


export interface AppEnvironment {
    production: boolean,
    log_errors: boolean,
    render_from_json: boolean,
    multi_cluster: boolean,
    base_url: string,
    stellium_domain: string,
    modules: string[],
    ssl_path: string,
    use_ssl: boolean,
    key_file: string,
    crt_file: string,
    port: number,
    database_auth: string,
    database_name: string,
    secret: string,
    redis_index: number,
}

export const ENV: AppEnvironment = require(path.resolve(StelliumRootPath, 'env'))
