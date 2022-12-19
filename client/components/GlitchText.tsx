import React from "react"
import styles from "../styles/glitchText.module.scss"

type GlitchTextProps = {
    title: String
}

export default function GlitchText({ title = "Adarsh M" }: GlitchTextProps) {
    return (
        <React.Fragment>
            <h2 className={styles.glitch} data-text={title}>{title}</h2>
        </React.Fragment>
    )
}