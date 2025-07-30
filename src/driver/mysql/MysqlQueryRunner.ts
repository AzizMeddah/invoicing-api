import { QueryFailedError } from 'typeorm';

class MysqlQueryRunner {
    // ...existing code...

    async insert(query: string, parameters: any[]) {
        // Validate parameters to ensure no NaN values
        parameters.forEach(param => {
            if (typeof param === 'number' && isNaN(param)) {
                throw new QueryFailedError(query, parameters, new Error('Invalid parameter: NaN value detected'));
            }
        });

        // Execute the query
        try {
            // ...existing code to execute the query...
        } catch (error) {
            throw new QueryFailedError(query, parameters, error);
        }
    }

    // ...existing code...
}