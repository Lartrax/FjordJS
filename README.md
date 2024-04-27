<p>
    <img src="assets/banner.webp" alt="FjordJS">
</p>

# FjordJS

### A Norwegian JavaScript transpiler

<br/>

This project is a demo allowing written Norwegian to be converted into JavaScript.

Example:

<table>
<tr>
<th>Norwegian</th>
<th>JavaScript</th>
</tr>
<tr>
<td>
 
```go

La i være 0.

Imens i undergår 10,
så loggfør i,
samt i++.

Dersom i tilsvarer 9,
så loggfør "i = 9",
ellers loggfør "i = " + i,
samt loggfør "hei!".





````

</td>
<td>

```js

let i = 0 ;

while ( i < 10 ) {
  console.log( i );
  i++;
};

if ( i === 9 ) {
  console.log( "i = 9" )
} else {
  console.log( "i = " + i );
  console.log( "hei!");
};
````

</td>
</tr>
</table>
