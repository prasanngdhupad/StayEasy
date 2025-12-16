import React, { useState } from 'react'
import '../componentStyles/Rating.css'
function Rating({value,onRatingChange,disable}) {
    const [hoveredRating,sethoveredRating]=useState(0)
    const [selectedRating,setSelectedRating]=useState(value||0);

    const handleMouseEnter=(rating)=>{
        if(!disable){
            sethoveredRating(rating)
        }
    }

    const handleMouseLeave=(rating)=>{
        if(!disable){
            sethoveredRating(0)
        }
    }

    const handleClick=(rating)=>{
        if(!disable){
            setSelectedRating(rating);
            if(onRatingChange){
                onRatingChange(rating)
            }
        }
    }

    const generateStars=()=>{
        const stars=[];
        for(let i=1;i<=5;i++){
            const isFilled=i<=(hoveredRating||selectedRating);
            stars.push(
                <span
                key={i}
                className={`star ${isFilled?'filled':'empty'}`}
                onMouseEnter={()=>handleMouseEnter(i)}
                onMouseLeave={handleMouseLeave}
                onClick={()=>handleClick(i)}
                style={{pointerEvents:disable?'none':'auto'}}
                >
                ★
                </span>
            )
        }
        return stars;
    }
    return (
        <div>
            <div className="rating">
                {generateStars()}
            </div>
        </div>
    )
}

export default Rating
