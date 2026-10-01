import { getDB } from "./database"


export async function saveExamHistory(history) {

    const db = await getDB()

    await db.execute("BEGIN TRANSACTION")

    try {

        const result = history.result

        //--------------------------------------------------
        // Save exam history
        //--------------------------------------------------

        await db.execute(

            `
            INSERT INTO exam_history(

                examType,
                mode,

                startTime,
                endTime,

                total,
                answered,
                unanswered,

                correct,
                wrong,

                percentage,

                aggregate,
                maxAggregate,

                duration,
                durationUsed,

                timeSpent,
                speed

            )
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            `,

            [

                result.examType,
                result.mode,

                result.startTime,
                result.endTime,

                result.total,
                result.answered,
                result.unanswered,

                result.correct,
                result.wrong,

                result.percentage,

                result.aggregate,
                result.maxAggregate,

                result.duration ?? result.totalDuration ?? 0,
                result.durationUsed ?? 0,

                result.timeSpent ?? "00:00:00",
                result.speed ?? 0

            ]

        )

        //--------------------------------------------------
        // Get history id
        //--------------------------------------------------

        const rows = await db.select(

            "SELECT last_insert_rowid() AS id"

        )

        const historyId = rows[0].id

        //--------------------------------------------------
        // Save subject summaries
        //--------------------------------------------------

        const subjects = history.subjects ?? result.subjects

        if (Array.isArray(subjects)) {

            for (const subject of subjects) {

                await db.execute(

                    `
                    INSERT INTO exam_subjects(

                        historyId,

                        subjectId,
                        subjectName,

                        total,
                        answered,
                        correct,
                        wrong,

                        score,
                        maxScore

                    )
                    VALUES(?,?,?,?,?,?,?,?,?)
                    `,

                    [

                        historyId,

                        subject.id,
                        subject.name,

                        subject.total,
                        subject.answered,
                        subject.correct,
                        subject.wrong,

                        subject.score,
                        subject.maxScore

                    ]

                )

            }

        }

        //--------------------------------------------------
        // Save answers
        //--------------------------------------------------

        if (Array.isArray(history.questions)) {

            for (const question of history.questions) {

                await db.execute(

                    `
                    INSERT INTO exam_answers(

                        historyId,

                        questionId,

                        subject,

                        year,

                        question,

                        options,

                        answer,

                        userAnswer,

                        isCorrect,

                        timeSpent,

                        bookmarked

                    )
                    VALUES(?,?,?,?,?,?,?,?,?,?,?)
                    `,

                    [

                        historyId,

                        question.id,

                        question.subject,

                        question.year,

                        question.question,

                        JSON.stringify(question.options ?? {}),

                        question.answer,

                        question.userAnswer,

                        question.answer === question.userAnswer ? 1 : 0,

                        question.timeSpent ?? 0,

                        question.bookmarked ? 1 : 0

                    ]

                )

            }

        }

        //--------------------------------------------------
        // Commit transaction
        //--------------------------------------------------

        await db.execute("COMMIT")

        return historyId

    }

    catch (error) {

        await db.execute("ROLLBACK")

        console.error("saveExamHistory:", error)

        throw error

    }

}



export async function getExamHistories() {

    const db = await getDB()

    // Get all exam history
    const histories = await db.select(`
        SELECT *
        FROM exam_history
        ORDER BY createdAt DESC
    `)

    // Attach subjects and questions to each history
    for (const history of histories) {

        history.subjects = await db.select(
            `
            SELECT *
            FROM exam_subjects
            WHERE historyId = ?
            `,
            [history.id]
        )

        history.questions = await db.select(
            `
            SELECT *
            FROM exam_answers
            WHERE historyId = ?
            `,
            [history.id]
        )

        // Convert JSON string back into an object
        history.questions = history.questions.map(question => ({
            ...question,
            options: question.options
                ? JSON.parse(question.options)
                : {}
        }))

    }

    return histories

}

export async function getExamHistoryById(id) {

    const db = await getDB()

    //--------------------------------------------------
    // Get exam history
    //--------------------------------------------------

    const rows = await db.select(
        `
        SELECT *
        FROM exam_history
        WHERE id = ?
        LIMIT 1
        `,
        [id]
    )

    if (rows.length === 0) {

        return null

    }

    const history = rows[0]

    //--------------------------------------------------
    // Get subjects
    //--------------------------------------------------

    history.subjects = await db.select(
        `
        SELECT *
        FROM exam_subjects
        WHERE historyId = ?
        ORDER BY id
        `,
        [id]
    )

    //--------------------------------------------------
    // Get answers
    //--------------------------------------------------

    history.questions = await db.select(
        `
        SELECT *
        FROM exam_answers
        WHERE historyId = ?
        ORDER BY id
        `,
        [id]
    )

    //--------------------------------------------------
    // Convert options JSON back to object
    //--------------------------------------------------

    history.questions = history.questions.map(question => ({

        ...question,

        options: question.options
            ? JSON.parse(question.options)
            : {}

    }))

    return history

}



export async function deleteExamHistory(id) {

    const db = await getDB()

    try {

        await db.execute("BEGIN TRANSACTION")

        await db.execute(
            `
            DELETE FROM exam_history
            WHERE id = ?
            `,
            [id]
        )

        await db.execute("COMMIT")

        return true

    }

    catch (error) {

        await db.execute("ROLLBACK")

        console.error("deleteExamHistory:", error)

        throw error

    }

}


export async function clearExamHistory() {

    const db = await getDB()

    try {

        await db.execute("BEGIN TRANSACTION")

        await db.execute(`
            DELETE FROM exam_history
        `)

        await db.execute("COMMIT")

        return true

    }

    catch (error) {

        await db.execute("ROLLBACK")

        console.error("clearExamHistory:", error)

        throw error

    }

}