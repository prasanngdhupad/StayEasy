// utils/apiFunctionality.js

class APIFunctionality {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    // =======================================================
    // 1. SEARCH: Handles keyword/location search on schema fields
    // =======================================================
    search() {
        const keyword = this.queryStr.keyword 
            ? {
                // Use $or to search across multiple relevant fields defined in your schema
                $or: [
                    // Case-insensitive search using $regex and $options: "i"
                    { title: { $regex: this.queryStr.keyword, $options: "i" } },
                    { city: { $regex: this.queryStr.keyword, $options: "i" } },
                    { locality: { $regex: this.queryStr.keyword, $options: "i" } }
                ]
            }
            : {}; // If no keyword, search criteria is an empty object

        this.query = this.query.find(keyword);
        return this;
    }

    // =======================================================
    // 2. FILTER: Handles category, min/max price
    // =======================================================
    filter() {
        const queryCopy = { ...this.queryStr };

        // 1. Remove non-filter fields
        const removeFields = ["keyword", "page", "sort", "limit"];
        removeFields.forEach((key) => delete queryCopy[key]);

        let combinedFilter = {};

        // 2. Handle Price Range Filtering (minPrice & maxPrice)
        let priceFilter = {};
        
        // Check for minPrice and assign to $gte operator
        if (queryCopy.minPrice) {
            priceFilter.$gte = Number(queryCopy.minPrice);
            delete queryCopy.minPrice;
        }

        // Check for maxPrice and assign to $lte operator
        if (queryCopy.maxPrice) {
            priceFilter.$lte = Number(queryCopy.maxPrice);
            delete queryCopy.maxPrice;
        }
        
        // Apply the price range filter to the 'startingRent' field
        if (Object.keys(priceFilter).length > 0) {
            // The startingRent field will now have the $gte/$lte operators applied
            combinedFilter.startingRent = priceFilter;
        }

        // 3. Handle Category/PropertyType Filter
        // Check if propertyType exists in the remaining queryCopy
        if (queryCopy.propertyType) {
            combinedFilter.propertyType = queryCopy.propertyType;
            delete queryCopy.propertyType;
        }
        
        // If there are other filters, they are added here implicitly.

        // Apply all combined filters to the Mongoose query
        this.query = this.query.find(combinedFilter);

        return this;
    }

    // =======================================================
    // 3. SORT: Handles sorting by price
    // =======================================================
    sort() {
        if (this.queryStr.sort) {
            let sortOption = {};
            
            // Map the frontend values to Mongoose sorting values
            if (this.queryStr.sort === 'price_asc') {
                // Sort by startingRent: 1 (ascending)
                sortOption.startingRent = 1;
            } else if (this.queryStr.sort === 'price_desc') {
                // Sort by startingRent: -1 (descending)
                sortOption.startingRent = -1;
            }
            
            if (Object.keys(sortOption).length > 0) {
                this.query = this.query.sort(sortOption);
            }
        }
        return this;
    }

    // =======================================================
    // 4. PAGINATION
    // =======================================================
    pagination(resultsPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resultsPerPage * (currentPage - 1);
        this.query = this.query.limit(resultsPerPage).skip(skip);
        return this;
    }
}

export default APIFunctionality;