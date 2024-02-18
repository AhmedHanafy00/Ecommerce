export const isAuthorized = (...roles) => {
    return async (req, res, next) => {

        // check user role
        if (!roles.includes(req.user.role))
            return next(new Error("You aren't authorized to make this action!!", { cause: 403 }));

        return next();
    }
}

