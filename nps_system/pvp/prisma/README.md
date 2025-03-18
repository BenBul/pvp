Prisma as of now doesnt support RLS migrations 

On the very first prisma pull, once the database is created insert this SQL code:

```

CREATE ROLE authenticated;

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Survey" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Question" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Answer" ENABLE ROW LEVEL SECURITY;


CREATE POLICY survey_own_access 
ON "Survey"
FOR SELECT USING (user_id = current_setting('jwt.claims.user_id'));

CREATE POLICY survey_insert 
ON "Survey"
FOR INSERT WITH CHECK (user_id = current_setting('jwt.claims.user_id'));

CREATE POLICY survey_update 
ON "Survey"
FOR UPDATE USING (user_id = current_setting('jwt.claims.user_id'));


CREATE POLICY survey_own_access 
ON "Survey"
FOR SELECT 
USING (user_id = current_setting('jwt.claims.user_id')::uuid);

CREATE POLICY survey_insert 
ON "Survey"
FOR INSERT 
WITH CHECK (user_id = current_setting('jwt.claims.user_id')::uuid);

CREATE POLICY survey_update 
ON "Survey"
FOR UPDATE 
USING (user_id = current_setting('jwt.claims.user_id')::uuid);

-- ❓ Users can fully manage questions on their own surveys
CREATE POLICY question_full_access 
ON "Question"
FOR ALL 
USING (
    survey_id IN (
        SELECT id FROM "Survey" WHERE user_id = current_setting('jwt.claims.user_id')::uuid
    )
);

CREATE POLICY answer_all_access 
ON "Answer"
FOR ALL 
USING (true);

```