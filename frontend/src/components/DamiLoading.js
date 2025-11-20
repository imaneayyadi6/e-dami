import React from "react";
import { Placeholder } from "react-bootstrap";

const DamiLoading = ({ mini = false }) => {
  return (
    <Placeholder animation='glow'>
      <div className={`dami ${mini ? "mini-dami" : ""}`}>
        <div className='dami-header'>
          <div className='dami-snrt-logo'>
            <img alt='dami-logo' src='/images/logo.png' className='dami-logo' />
          </div>
          <div className='dami-lb-tp'>
            <span className='d-block dami-type-de-processus'>
              <Placeholder xs={12} />
            </span>
            <span className='d-block dami-libelle'>
              <Placeholder xs={12} />
            </span>
          </div>
          <div className='dami-codification'>
            <table className='dami-codification-table '>
              <tr>
                <td>document</td>
                <td>
                  <Placeholder xs={12} style={{ width: '100px' }} />
                </td>
              </tr>
              <tr>
                <td>classification</td>
                <td>
                  <Placeholder xs={12} style={{ width: '100px' }} />
                </td>
              </tr>
              <tr>
                <td>creation</td>
                <td>
                  <Placeholder xs={12} style={{ width: '100px' }} />
                </td>
              </tr>
              <tr>
                <td>maj</td>
                <td>
                  <Placeholder xs={12} style={{ width: '100px' }} />
                </td>
              </tr>
            </table>
          </div>
        </div>
        <div className='demandeur-section'>
          <table>
            <tr>
              <td>
                <label>Date demande:</label>
              </td>
              <td>
                <input
                  className='dami-input'
                  value={new Date().toLocaleDateString()}
                />
              </td>
              <td>
                <label>Direction</label>
              </td>
              <td>
                <input className='dami-input' />
              </td>
            </tr>
            <tr>
              <td>
                <label>Nom:</label>
              </td>
              <td>
                <input className='dami-input' />
              </td>
              <td>
                <label>Prenom</label>
              </td>
              <td>
                <input className='dami-input' />
              </td>
            </tr>
            <tr>
              <td>
                <label>Matricule:</label>
              </td>
              <td>
                <input className='dami-input' />
              </td>
              <td>
                <label>Service</label>
              </td>
              <td>
                <input className='dami-input' />
              </td>
            </tr>
            <tr>
              <td>
                <label>Email:</label>
              </td>
              <td>
                <input className='dami-input' />
              </td>
              <td>
                <label>Gsm</label>
              </td>
              <td>
                <input className='dami-input' />
              </td>
            </tr>
          </table>
        </div>
        <div className='dami-body p-2'>
          <div className='ml-2  '>
            <Placeholder xs={2} className='ml-1' />
            <Placeholder xs={2} className='ml-1' />
            <Placeholder xs={2} className='ml-1' />
            <Placeholder xs={2} className='ml-1' />
            <Placeholder xs={2} className='ml-1' />
            <Placeholder xs={2} className='ml-1' />
            <Placeholder xs={2} className='ml-1' />
            <Placeholder xs={2} className='ml-1' />
            <Placeholder xs={2} className='ml-1' />
            <Placeholder xs={2} className='ml-1' />
            <Placeholder xs={2} className='ml-1' />
            <Placeholder xs={2} className='ml-1' />
            <Placeholder xs={2} className='ml-1' />
            <Placeholder xs={2} className='ml-1' />
            <Placeholder xs={2} className='ml-1' />
            <Placeholder xs={2} className='ml-1' />
            <Placeholder xs={2} className='ml-1' />
            <Placeholder xs={2} className='ml-1' />
            <Placeholder xs={2} className='ml-1' />
            <Placeholder xs={2} className='ml-1' />
            <Placeholder xs={2} className='ml-1' />
            <Placeholder xs={2} className='ml-1' />
            <Placeholder xs={2} className='ml-1' />
            <Placeholder xs={2} className='ml-1' />
            <Placeholder xs={2} className='ml-1' />
            <Placeholder xs={2} className='ml-1' />
            <Placeholder xs={2} className='ml-1' />
            <Placeholder xs={2} className='ml-1' />
            <Placeholder xs={2} className='ml-1' />
            <Placeholder xs={2} className='ml-1' />
          </div>
        </div>
        {}
      </div>
    </Placeholder>
  );
};

export default DamiLoading;
