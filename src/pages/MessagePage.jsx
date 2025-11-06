export default function MessagePage({
    icon = null,
    mainColor = "temp",
    title = "temp title",
    paragraph = "temp paragraph",
    textColor = "black",
    buttonText = "temp button text",
    onClickFunc = () => { console.error("Error: onClick function not set") },
    buttonTextColor = "temp"
}) {

    // TODO: temp debug print
    console.log("icon");
    console.log(icon);
    console.log("bg-main color => \t" + `bg-${mainColor}`)
    console.log("on click function:")
    console.log(onClickFunc)

    // TODO: handle temp values, handle the case where variables are not set (icon included)
    return (
        <div className={`flex flex-col items-center justify-center w-full h-full space-y-10`}>
            {icon}
            <div className="flex flex-col items-center space-y-5">
                <h1 className={`text-${textColor} text-2xl font-bold`}>{title}</h1>
                <p className={`text-${textColor} text-lg`}>{paragraph}</p>
            </div>
            <button
                className={`bg-${mainColor} text-${buttonTextColor} text-lg font-semibold py-4 px-8 rounded-md hover:bg-${mainColor}/50`}
                onClick={onClickFunc}
            >{buttonText}</button>
        </div>
    );
}